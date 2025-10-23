-- staging model for Tags
select
  tagid as tag_id,
  tagname as tag_name,
  tagdesc as tag_desc
from {{ source('mysql_lis640', 'Tags') }}
