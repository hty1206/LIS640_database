-- staging model for Occupancy
select
  occuid as occu_id,
  facilityid as facility_id,
  CAST(occuday AS DATE) as occu_day,
  occuhour as occu_hour,
  occuparktype as occu_park_type,
  occucount as occu_count
from {{ source('mysql_lis640', 'Occupancy') }}
