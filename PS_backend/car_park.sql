-- DROP DATABASE car_park;
CREATE DATABASE car_park;
USE car_park; 

CREATE TABLE parking_spaces (
	parking_space_id INT PRIMARY KEY,
	parking_space VARCHAR(5) NOT NULL,
    space_type VARCHAR(20),
    availability BOOLEAN DEFAULT 1
);

-- DROP TABLE parking_booking;
CREATE TABLE parking_booking (
	booking_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
	booking_length INT NOT NULL DEFAULT 6,
    booking_start_time DATETIME DEFAULT NOW(), -- DATETIME format is YYYY-MM-DD HH:MI:SS
    booking_end_time DATETIME, -- derive from start time and selected booking length
    parking_space VARCHAR(5) NOT NULL,
    special_requirements VARCHAR(20)
);

INSERT INTO parking_spaces 
VALUES
(100, "0A", "disabled", 1),
(101, "0B", "disabled", 1),
(102, "0C", "disabled", 1),
(103, "0D", "disbaled", 1),
(104, "0E", "wider", 1),
(105, "0F", "wider", 1),
(106, "0G", "wider", 1),
(107, "0H", "wider", 1),
(108, "0I", "wider", 1),
(109, "0J", "wider", 1),
(110, "0K", "regular", 1),
(111, "0L", "regular", 1),
(112, "0M", "regular", 1),
(113, "0N", "regular", 1),
(114, "0O", "regular", 1),
(115, "0P", "regular", 1),
(116, "0Q", "regular", 1),
(117, "0R", "regular", 1),
(118, "0S", "regular", 1),
(119, "0T", "regular", 1),
(120, "0U", "regular", 1),
(121, "0V", "regular", 1),
(122, "0W", "regular", 1),
(123, "0X", "regular", 1),
(124, "0Y", "regular", 1),
(125, "0Z", "regular", 1);

