-- staging model for Facilities
select
  facilityid as facility_id,
  facilityname as facility_name,
  facilitylocation as facility_location
from {{ source('mysql_lis640', 'Facilities') }}
