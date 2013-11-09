/*
 * This view lists all postgres usernames that are associated with a CRM
 * Account that owns an address. That associaiton is either the main user
 * account, owner's user account, customer's sale rep's user account or
 * a shared access that has been specifically granted.
 *
 * This view can be used to determine which users have personal privilege
 * access to an address based on what CRM Account it belongs to or shared
 * access grants.
 */

select xt.create_view('xt.crmacctaddr_users', $$

SELECT
  addr_id,
  array_agg(username) AS crmacct_usernames
FROM (
  -- CRM Account's users.
  SELECT
    addr_id,
    username
  FROM xt.crmacctaddr
  LEFT JOIN xt.crmacct_users USING (crmacct_id)
  WHERE 1=1
    AND username IS NOT NULL

  -- Shared access grants.
  UNION
  SELECT
    obj_share_target_id AS addr_id,
    obj_share_user AS username
  FROM xt.obj_share
  WHERE 1=1
    AND obj_share_type = 'ADDR'
) shipto_users

GROUP BY addr_id;

$$, false);
