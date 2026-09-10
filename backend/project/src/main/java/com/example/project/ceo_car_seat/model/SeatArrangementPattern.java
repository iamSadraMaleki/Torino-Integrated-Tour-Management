package com.example.project.ceo_car_seat.model;

public enum SeatArrangementPattern {
    LEFT_TO_RIGHT,    // از چپ به راست (1, 2, 3, 4, ...)
    RIGHT_TO_LEFT,    // از راست به چپ (4, 3, 2, 1, ...)
    COLUMN_WISE,      // ستونی (همه ستون A، بعد B، ...)
    ROW_WISE          // ردیفی (همه ردیف 1، بعد 2، ...)
}

