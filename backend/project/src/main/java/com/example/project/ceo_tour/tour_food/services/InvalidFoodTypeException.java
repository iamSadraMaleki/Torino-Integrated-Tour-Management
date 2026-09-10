package com.example.project.ceo_tour.tour_food.services;

public class InvalidFoodTypeException extends RuntimeException {
    public InvalidFoodTypeException(String message) { super(message); }
}