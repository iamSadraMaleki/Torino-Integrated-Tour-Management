package com.example.project.ceo_car_seat.services;

import com.example.project.ceo_car.model.Vehicle;
import com.example.project.ceo_car.repository.VehicleRepository;
import com.example.project.ceo_car_seat.dto.*;
import com.example.project.ceo_car_seat.model.Seat;
import com.example.project.ceo_car_seat.model.SeatArrangement;
import com.example.project.ceo_car_seat.model.SeatArrangementPattern;
import com.example.project.ceo_car_seat.model.SeatType;
import com.example.project.ceo_car_seat.repository.SeatArrangementRepository;
import com.example.project.ceo_car_seat.repository.SeatRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final SeatArrangementRepository arrangementRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final SeatMapper seatMapper;
    private static final Logger logger = LoggerFactory.getLogger(SeatServiceImpl.class);

    @Override
    @Transactional
    public List<SeatDto> generateSeats(String username, SeatGenerateRequest request) {
        logger.info("Generating seats for vehicle {} by CEO {}", request.getVehicleId(), username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(request.getVehicleId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        // بررسی وجود صندلی قبلی
        if (seatRepository.existsByVehicleId(vehicle.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "صندلی‌ها برای این ماشین قبلاً تولید شده‌اند. لطفاً ابتدا آن‌ها را حذف کنید");
        }

        // دریافت الگوی چینش
        SeatArrangement arrangement;
        if (request.getArrangementId() != null) {
            arrangement = arrangementRepository.findByIdAndUserId(request.getArrangementId(), user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "الگوی چینش پیدا نشد"));
        } else {
            arrangement = arrangementRepository.findDefaultByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "الگوی پیش‌فرض پیدا نشد. لطفاً یک الگو را به عنوان پیش‌فرض تنظیم کنید یا شناسه الگو را مشخص کنید"));
        }

        // تولید صندلی‌ها
        List<Seat> seats = createSeatsBasedOnPattern(user, vehicle, arrangement.getPattern());

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        logger.info("Generated {} seats for vehicle {}", savedSeats.size(), vehicle.getId());

        return savedSeats.stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * تولید صندلی‌ها بر اساس الگوی چینش
     */
    private List<Seat> createSeatsBasedOnPattern(User user, Vehicle vehicle, SeatArrangementPattern pattern) {
        List<Seat> seats = new ArrayList<>();
        Integer totalSeats = vehicle.getSeatCount();
        Integer rowCount = vehicle.getRowCount();

        // محاسبه تعداد صندلی در هر ردیف
        int seatsPerRow = (int) Math.ceil((double) totalSeats / rowCount);

        int seatNumber = 1;

        switch (pattern) {
            case LEFT_TO_RIGHT:
                // از چپ به راست، ردیف به ردیف
                for (int row = 1; row <= rowCount; row++) {
                    for (int pos = 1; pos <= seatsPerRow && seatNumber <= totalSeats; pos++) {
                        seats.add(createSeat(user, vehicle, seatNumber++, row, getPosition(pos)));
                    }
                }
                break;

            case RIGHT_TO_LEFT:
                // از راست به چپ، ردیف به ردیف
                for (int row = 1; row <= rowCount; row++) {
                    for (int pos = seatsPerRow; pos >= 1 && seatNumber <= totalSeats; pos--) {
                        seats.add(createSeat(user, vehicle, seatNumber++, row, getPosition(pos)));
                    }
                }
                break;

            case COLUMN_WISE:
                // ستونی - هر ستون رو کامل می‌کنیم
                for (int pos = 1; pos <= seatsPerRow; pos++) {
                    for (int row = 1; row <= rowCount && seatNumber <= totalSeats; row++) {
                        seats.add(createSeat(user, vehicle, seatNumber++, row, getPosition(pos)));
                    }
                }
                break;

            case ROW_WISE:
            default:
                // ردیفی - مانند LEFT_TO_RIGHT
                for (int row = 1; row <= rowCount; row++) {
                    for (int pos = 1; pos <= seatsPerRow && seatNumber <= totalSeats; pos++) {
                        seats.add(createSeat(user, vehicle, seatNumber++, row, getPosition(pos)));
                    }
                }
                break;
        }

        return seats;
    }

    /**
     * ایجاد یک صندلی
     */
    private Seat createSeat(User user, Vehicle vehicle, int seatNumber, int row, String position) {
        return Seat.builder()
                .user(user)
                .vehicle(vehicle)
                .seatNumber(seatNumber)
                .rowNumber(row)
                .position(position)
                .seatType(SeatType.REGULAR)
                .isActive(true)
                .build();
    }

    /**
     * تعیین جایگاه بر اساس موقعیت
     */
    private String getPosition(int pos) {
        String[] positions = {"A", "B", "C", "D", "E", "F"};
        return pos <= positions.length ? positions[pos - 1] : "X";
    }

    @Override
    @Transactional
    public SeatDto updateSeat(String username, Long seatId, SeatUpdateRequest request) {
        logger.info("Updating seat {} by CEO {}", seatId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Seat seat = seatRepository.findByIdAndUserId(seatId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صندلی پیدا نشد"));

        if (request.getIsActive() != null) {
            seat.setIsActive(request.getIsActive());
        }
        if (request.getSeatType() != null) {
            seat.setSeatType(request.getSeatType());
        }
        if (request.getNotes() != null) {
            seat.setNotes(request.getNotes());
        }

        Seat updated = seatRepository.save(seat);
        logger.info("Seat updated successfully");

        return seatMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteSeatsByVehicle(String username, Long vehicleId) {
        logger.info("Deleting all seats for vehicle {} by CEO {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        seatRepository.deleteByVehicleIdAndUserId(vehicle.getId(), user.getId());
        logger.info("All seats deleted successfully for vehicle {}", vehicleId);
    }

    @Override
    @Transactional(readOnly = true)
    public SeatDto getSeat(String username, Long seatId) {
        logger.info("Fetching seat {} by CEO {}", seatId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Seat seat = seatRepository.findByIdAndUserId(seatId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صندلی پیدا نشد"));

        return seatMapper.toDto(seat);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByVehicle(String username, Long vehicleId) {
        logger.info("Fetching all seats for vehicle {} by CEO {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return seatRepository.findByVehicleIdOrderBySeatNumberAsc(vehicle.getId())
                .stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getActiveSeatsByVehicle(String username, Long vehicleId) {
        logger.info("Fetching active seats for vehicle {} by CEO {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return seatRepository.findByVehicleIdAndIsActiveTrueOrderBySeatNumberAsc(vehicle.getId())
                .stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByRow(String username, Long vehicleId, Integer rowNumber) {
        logger.info("Fetching seats for vehicle {} row {} by CEO {}", vehicleId, rowNumber, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return seatRepository.findByVehicleIdAndRowNumberOrderBySeatNumberAsc(vehicle.getId(), rowNumber)
                .stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SeatStatisticsDto getStatistics(String username, Long vehicleId) {
        logger.info("Fetching statistics for vehicle {} by CEO {}", vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        List<Seat> seats = seatRepository.findByVehicleIdOrderBySeatNumberAsc(vehicle.getId());

        long totalSeats = seats.size();
        long activeSeats = seatRepository.countActiveByVehicleId(vehicle.getId());
        long inactiveSeats = totalSeats - activeSeats;

        long vipSeats = seatRepository.countByVehicleIdAndType(vehicle.getId(), SeatType.VIP);
        long regularSeats = seatRepository.countByVehicleIdAndType(vehicle.getId(), SeatType.REGULAR);
        long wheelchairSeats = seatRepository.countByVehicleIdAndType(vehicle.getId(), SeatType.WHEELCHAIR);
        long driverSeats = seatRepository.countByVehicleIdAndType(vehicle.getId(), SeatType.DRIVER);

        // تعداد صندلی به تفکیک ردیف
        Map<Integer, Long> seatsByRow = seats.stream()
                .collect(Collectors.groupingBy(Seat::getRowNumber, Collectors.counting()));

        return SeatStatisticsDto.builder()
                .vehicleId(vehicle.getId())
                .vehicleName(vehicle.getName())
                .totalSeats(totalSeats)
                .activeSeats(activeSeats)
                .inactiveSeats(inactiveSeats)
                .vipSeats(vipSeats)
                .regularSeats(regularSeats)
                .wheelchairSeats(wheelchairSeats)
                .driverSeats(driverSeats)
                .seatsByRow(seatsByRow)
                .build();
    }
    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByStatus(String username, Long vehicleId, Boolean isActive) {
        logger.info("Fetching seats with status {} for vehicle {} by CEO {}", isActive, vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return seatRepository.findByVehicleIdAndIsActiveAndUserId(vehicle.getId(), isActive, user.getId())
                .stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByType(String username, Long vehicleId, SeatType seatType) {
        logger.info("Fetching seats with type {} for vehicle {} by CEO {}", seatType, vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return seatRepository.findByVehicleIdAndSeatTypeAndUserId(vehicle.getId(), seatType, user.getId())
                .stream()
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByStatusAndType(String username, Long vehicleId, Boolean isActive, SeatType seatType) {
        logger.info("Fetching seats with status {} and type {} for vehicle {} by CEO {}",
                isActive, seatType, vehicleId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ماشین پیدا نشد"));

        return seatRepository.findByVehicleIdAndIsActiveAndSeatTypeOrderBySeatNumberAsc(
                        vehicle.getId(), isActive, seatType)
                .stream()
                .filter(seat -> seat.getUser().getId().equals(user.getId()))
                .map(seatMapper::toDto)
                .collect(Collectors.toList());
    }
}

