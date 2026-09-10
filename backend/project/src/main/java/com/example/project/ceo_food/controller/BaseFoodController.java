package com.example.project.ceo_food.controller;

import com.example.project.ceo_food.dto.BaseFoodDto;
import com.example.project.ceo_food.dto.CreateBaseFoodRequest;
import com.example.project.ceo_food.services.BaseFoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo/base-food")
@RequiredArgsConstructor
public class BaseFoodController {

    private final BaseFoodService baseFoodService;

    @PostMapping
    public ResponseEntity<BaseFoodDto> create(@Valid @RequestBody CreateBaseFoodRequest request) {
        log.info("POST /api/ceo/base-food - Creating food: {}", request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(baseFoodService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseFoodDto> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateBaseFoodRequest request) {
        log.info("PUT /api/ceo/base-food/{} - Updating base food", id);
        return ResponseEntity.ok(baseFoodService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/ceo/base-food/{} - Deleting base food", id);
        baseFoodService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<BaseFoodDto>> getMyFoods() {
        log.debug("GET /api/ceo/base-food - Fetching foods for current user");
        return ResponseEntity.ok(baseFoodService.getMyFoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseFoodDto> getById(@PathVariable Long id) {
        log.debug("GET /api/ceo/base-food/{} - Fetching base food by id", id);
        return ResponseEntity.ok(baseFoodService.getById(id));
    }
}
