package com.example.project.profile.ceoinfo.services;


import com.example.project.profile.ceoinfo.dto.BankAccountDto;
import com.example.project.profile.ceoinfo.dto.BankAccountRequest;
import com.example.project.profile.ceoinfo.mapper.BankAccountMapper;
import com.example.project.profile.ceoinfo.model.BankAccount;
import com.example.project.profile.ceoinfo.repository.BankAccountRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final BankAccountMapper bankAccountMapper;
    private final AuditLogService auditLogService;
    private static final Logger logger = LoggerFactory.getLogger(BankAccountServiceImpl.class);

    @Override
    @Transactional
    public BankAccountDto createBankAccount(String username, BankAccountRequest request, HttpServletRequest httpRequest) {
        logger.info("Creating bank account for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));


        if (bankAccountRepository.existsByUserId(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "اطلاعات بانکی قبلاً ثبت شده است");
        }


        if (bankAccountRepository.existsByIban(request.getIban())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این شماره شبا قبلاً ثبت شده است");
        }

        BankAccount bankAccount = BankAccount.builder()
                .user(user)
                .accountHolderName(request.getAccountHolderName())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .iban(request.getIban())
                .cardNumber(request.getCardNumber())
                .build();

        BankAccount saved = bankAccountRepository.save(bankAccount);

        // Fetch again with user to ensure proper loading
        BankAccount bankAccountWithUser = bankAccountRepository.findByIdWithUser(saved.getId())
                .orElse(saved);

        String ipAddress = getClientIp(httpRequest);
        auditLogService.logChange(user, "BankAccount", saved.getId(),
                "ALL", null, "CREATED", "CREATE", ipAddress);

        logger.info("Bank account created successfully for user: {}", username);
        return bankAccountMapper.toDto(bankAccountWithUser);
    }

    @Override
    @Transactional
    public BankAccountDto updateBankAccount(String username, BankAccountRequest request, HttpServletRequest httpRequest) {
        logger.info("Updating bank account for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        BankAccount bankAccount = bankAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اطلاعات بانکی پیدا نشد"));

        // بررسی اینکه آیا IBAN جدید قبلاً برای کاربر دیگری ثبت شده است
        if (!bankAccount.getIban().equals(request.getIban()) && bankAccountRepository.existsByIban(request.getIban())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این شماره شبا قبلاً برای کاربر دیگری ثبت شده است");
        }

        String ipAddress = getClientIp(httpRequest);

        logFieldChange(bankAccount, user, "accountHolderName",
                bankAccount.getAccountHolderName(), request.getAccountHolderName(), ipAddress);
        logFieldChange(bankAccount, user, "bankName",
                bankAccount.getBankName(), request.getBankName(), ipAddress);
        logFieldChange(bankAccount, user, "accountNumber",
                bankAccount.getAccountNumber(), request.getAccountNumber(), ipAddress);
        logFieldChange(bankAccount, user, "iban",
                bankAccount.getIban(), request.getIban(), ipAddress);
        logFieldChange(bankAccount, user, "cardNumber",
                bankAccount.getCardNumber(), request.getCardNumber(), ipAddress);

        // آپدیت مقادیر
        bankAccount.setAccountHolderName(request.getAccountHolderName());
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setIban(request.getIban());
        bankAccount.setCardNumber(request.getCardNumber());

        BankAccount updated = bankAccountRepository.save(bankAccount);
        
        // Fetch again with user to ensure proper loading
        BankAccount bankAccountWithUser = bankAccountRepository.findByIdWithUser(updated.getId())
                .orElse(updated);
        
        logger.info("Bank account updated successfully for user: {}", username);

        return bankAccountMapper.toDto(bankAccountWithUser);
    }

    @Override
    @Transactional(readOnly = true)
    public BankAccountDto getBankAccount(String username) {
        logger.info("Fetching bank account for user: {}", username);

        BankAccount bankAccount = bankAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اطلاعات بانکی پیدا نشد"));

        return bankAccountMapper.toDto(bankAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public BankAccountDto getBankAccountById(Long accountId) {
        logger.info("Fetching bank account by id: {}", accountId);

        BankAccount bankAccount = bankAccountRepository.findByIdWithUser(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اطلاعات بانکی پیدا نشد"));

        return bankAccountMapper.toDto(bankAccount);
    }

    @Override
    @Transactional
    public void deleteBankAccount(String username) {
        logger.info("Deleting bank account for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));

        BankAccount bankAccount = bankAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اطلاعات بانکی پیدا نشد"));

        bankAccountRepository.delete(bankAccount);
        logger.info("Bank account deleted successfully for user: {}", username);
    }

    private void logFieldChange(BankAccount account, User user, String fieldName,
                                String oldValue, String newValue, String ipAddress) {
        if (!java.util.Objects.equals(oldValue, newValue)) {
            auditLogService.logChange(user, "BankAccount", account.getId(),
                    fieldName, oldValue, newValue, "UPDATE", ipAddress);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}

