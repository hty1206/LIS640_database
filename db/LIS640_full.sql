-- MySQL dump 10.13  Distrib 8.4.0, for macos13.2 (arm64)
--
-- Host: localhost    Database: LIS640
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `LIS640`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `LIS640` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `LIS640`;

--
-- Table structure for table `Dates`
--

DROP TABLE IF EXISTS `Dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dates` (
  `DateID` int NOT NULL AUTO_INCREMENT,
  `DateValue` date NOT NULL,
  PRIMARY KEY (`DateID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Dates`
--

LOCK TABLES `Dates` WRITE;
/*!40000 ALTER TABLE `Dates` DISABLE KEYS */;
/*!40000 ALTER TABLE `Dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `EventName` varchar(512) NOT NULL,
  `EventStartDate` datetime NOT NULL,
  `EventEndDate` datetime DEFAULT NULL,
  `EventDesc` varchar(2000) DEFAULT NULL,
  `TagID` int DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  KEY `idx_events_start` (`EventStartDate`),
  KEY `idx_events_tag` (`TagID`),
  CONSTRAINT `fk_events_tag` FOREIGN KEY (`TagID`) REFERENCES `Tags` (`TagID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_event_dates_min` CHECK ((`EventStartDate` >= _utf8mb4'2020-01-01 00:00:00')),
  CONSTRAINT `chk_event_end_after_start` CHECK (((`EventEndDate` is null) or (`EventEndDate` >= `EventStartDate`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_events_default_end_before_insert` BEFORE INSERT ON `events` FOR EACH ROW BEGIN
  IF NEW.EventEndDate IS NULL THEN
    SET NEW.EventEndDate = TIMESTAMP(DATE(NEW.EventStartDate), '23:59:00');
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_events_default_end_before_update` BEFORE UPDATE ON `events` FOR EACH ROW BEGIN
  IF NEW.EventEndDate IS NULL THEN
    SET NEW.EventEndDate = TIMESTAMP(DATE(NEW.EventStartDate), '23:59:00');
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Facilities`
--

DROP TABLE IF EXISTS `Facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Facilities` (
  `FacilityID` int NOT NULL AUTO_INCREMENT,
  `FacilityName` varchar(255) DEFAULT NULL,
  `FacilityLocation` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`FacilityID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Facilities`
--

LOCK TABLES `Facilities` WRITE;
/*!40000 ALTER TABLE `Facilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `Facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Occupancy`
--

DROP TABLE IF EXISTS `Occupancy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Occupancy` (
  `OccuID` int NOT NULL AUTO_INCREMENT,
  `FacilityID` int NOT NULL,
  `OccuDay` date NOT NULL,
  `OccuHour` int NOT NULL,
  `OccuParkType` enum('Visitor','Other','Flex','Base Lot') NOT NULL,
  `OccuCount` int NOT NULL,
  PRIMARY KEY (`OccuID`),
  KEY `idx_occu_fac_day_hour` (`FacilityID`,`OccuDay`,`OccuHour`),
  KEY `idx_occu_type` (`OccuParkType`),
  CONSTRAINT `fk_occu_facility` FOREIGN KEY (`FacilityID`) REFERENCES `Facilities` (`FacilityID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_occu_count_nonneg` CHECK ((`OccuCount` >= 0)),
  CONSTRAINT `chk_occu_day_min` CHECK ((`OccuDay` >= _utf8mb4'2020-01-01')),
  CONSTRAINT `chk_occu_hour_range` CHECK ((`OccuHour` between 0 and 23))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Occupancy`
--

LOCK TABLES `Occupancy` WRITE;
/*!40000 ALTER TABLE `Occupancy` DISABLE KEYS */;
/*!40000 ALTER TABLE `Occupancy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tags`
--

DROP TABLE IF EXISTS `Tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tags` (
  `TagID` int NOT NULL AUTO_INCREMENT,
  `TagName` varchar(255) NOT NULL,
  `TagDesc` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`TagID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tags`
--

LOCK TABLES `Tags` WRITE;
/*!40000 ALTER TABLE `Tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Weather`
--

DROP TABLE IF EXISTS `Weather`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Weather` (
  `WeatherDate` date NOT NULL,
  `WeatherPrecip` decimal(4,2) DEFAULT NULL,
  `WeatherMinT` decimal(4,1) DEFAULT NULL,
  `WeatherAvgT` decimal(4,1) DEFAULT NULL,
  `WeatherMaxT` decimal(4,1) DEFAULT NULL,
  PRIMARY KEY (`WeatherDate`),
  CONSTRAINT `chk_weather_date_min` CHECK ((`WeatherDate` >= _utf8mb4'2020-01-01')),
  CONSTRAINT `chk_weather_precip_ge0` CHECK (((`WeatherPrecip` is null) or (`WeatherPrecip` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Weather`
--

LOCK TABLES `Weather` WRITE;
/*!40000 ALTER TABLE `Weather` DISABLE KEYS */;
/*!40000 ALTER TABLE `Weather` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'LIS640'
--

--
-- Dumping routines for database 'LIS640'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 17:33:02
