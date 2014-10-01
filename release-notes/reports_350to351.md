--------------------------------------------------------------------
REMOVED REPORTS:
InventoryHistoryByItem
InventoryHistoryByOrderNumber
InventoryHistoryByParameterList
InventoryHistoryByWarehouse
--------------------------------------------------------------------
NEW REPORTS:
InventoryHistory
--------------------------------------------------------------------
CHANGED REPORTS:
APOpenItemsByVendor
CashReceipts
EmployeeList
ExpiredInventoryByClassCode
GLTransactions
InventoryAvailabilityBySourceVendor
InvoiceInformation
ItemMaster
PurchasePriceVariancesByItem
PurchasePriceVariancesByVendor
QOHByParameterList
Statement
TodoByUserAndIncident
UsageStatisticsByClassCode
UsageStatisticsByItemGroup
UsageStatisticsByItem
UsageStatisticsByWarehouse
WOMaterialRequirementsByComponentItem
WOMaterialRequirementsByWorkOrder


 --------------------------------------------------------------------
 REPORT: APOpenItemsByVendor
 QUERY: head
-SELECT vend_name,
-       vend_number,
+SELECT
+<? if exists("vend_id") ?>
+       (SELECT vend_name FROM vendinfo WHERE vend_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+       (SELECT vendtype_code FROM vendtype WHERE vendtype_id=<? value("vendtype_id") ?>)
+<? elseif exists("vendtype_pattern") ?>
+       ('Vendor Type pattern = ' || <? value("vendtype_pattern") ?>)
+<? else ?>
+       'All Vendors'
+<? endif ?>
+       AS selection,
        currConcat(baseCurrId()) AS baseCurr,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
-       formatDate(<? value("asofDate") ?>) AS asofDate
-  FROM vend
- WHERE (vend_id=<? value("vend_id") ?>);
+       formatDate(<? value("asofDate") ?>) AS asofDate;
 --------------------------------------------------------------------

 QUERY: detail
-SELECT apopen_id, apopen_ponumber, apopen_docnumber,
-                    CASE WHEN (apopen_doctype='C') THEN <? value("creditMemo") ?>
-                         WHEN (apopen_doctype='D') THEN <? value("debitMemo") ?>
-                         WHEN (apopen_doctype='V') THEN <? value("voucher") ?>
-                         ELSE <? value("other") ?>
-                    END AS f_doctype,
-                    apopen_invcnumber AS invoicenumber,
-                    formatDate(apopen_docdate) AS f_docdate,
-                    formatDate(apopen_duedate) AS f_duedate,
-                    formatMoney(apopen_amount) AS f_amount,
-                    formatMoney(apopen_paid - COALESCE(SUM(apapply_target_paid),0)) AS f_paid,
-                    formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0)) *
-                    CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
-                    END) AS f_balance,
-                    currConcat(apopen_curr_id) AS currAbbr,
-                    (apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
-                    / apopen_curr_rate * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
-                         END) AS base_balance,
-                    formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
-                    / apopen_curr_rate * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
-                         END)) AS f_base_balance,
-                  CASE WHEN (apopen_status='O') THEN TEXT('Open')
-                    ELSE CASE WHEN (apopen_status='H') THEN TEXT('On Hold')
-                      ELSE CASE WHEN (apopen_status='C') THEN TEXT('Close')
-                      END
-                    END
-                  END AS status
-             FROM apopen
-               LEFT OUTER JOIN apapply ON (((apopen_id=apapply_target_apopen_id)
-                                       OR (apopen_id=apapply_source_apopen_id))
-                                       AND (apapply_postdate > <? value("asofDate") ?>))
-              WHERE ( (COALESCE(apopen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
-                AND   (apopen_docdate<=<? value("asofDate") ?>)
-                AND   (apopen_vend_id=<? value("vend_id") ?>)
-                AND   (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
-              GROUP BY apopen_id, apopen_ponumber, apopen_docnumber,apopen_doctype, apopen_invcnumber, apopen_docdate,
-                apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_curr_rate, apopen_status
-              ORDER BY apopen_docdate;
+== MetaSQL statement apOpenItems-detail


 --------------------------------------------------------------------
 REPORT: CashReceipts
+QUERY: foot
+SELECT formatMoney(SUM(base_applied)) AS f_base_applied_total
+FROM (
+<? if exists("LegacyDisplayMode") ?>
+-- Posted cash receipts
+SELECT  currtobase(arapply_curr_id,arapply_applied,arapply_postdate) AS base_applied
+FROM cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), arapply
+WHERE ( (arapply_cust_id=cust_id)
+  AND   (arapply_postdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+  AND   (arapply_source_doctype ='K')
+<? if exists("cust_id") ?>
+  AND   (cust_id=<? value("cust_id") ?>)
+<? elseif exists("custtype_id") ?>
+  AND   (cust_custtype_id=<? value("custtype_id") ?>)
+<? elseif exists("custgrp_id") ?>
+  AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
+<? elseif exists("custtype_pattern") ?>
+  AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
+<? endif ?>
+      )
+
+-- Unposted cash receipts
+UNION ALL
+SELECT currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied
+FROM cashrcpt, cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
+WHERE ( (NOT cashrcpt_posted)
+  AND   (cashrcpt_cust_id=cust_id)
+  AND   (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+<? if exists("cust_id") ?>
+  AND   (cust_id=<? value("cust_id") ?>)
+<? elseif exists("custtype_id") ?>
+  AND   (cust_custtype_id=<? value("custtype_id") ?>)
+<? elseif exists("custgrp_id") ?>
+  AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
+<? elseif exists("custtype_pattern") ?>
+  AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
+<? endif ?>
+      )
+
+-- Cash Advance
+UNION ALL
+SELECT aropen_amount / aropen_curr_rate AS base_applied
+FROM cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), aropen
+  JOIN cashrcptitem ON (aropen_id=cashrcptitem_aropen_id)
+WHERE ( (aropen_cust_id=cust_id)
+  AND   (aropen_doctype IN ('R','C'))
+  AND   (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+<? if exists("cust_id") ?>
+  AND   (cust_id=<? value("cust_id") ?>)
+<? elseif exists("custtype_id") ?>
+  AND   (cust_custtype_id=<? value("custtype_id") ?>)
+<? elseif exists("custgrp_id") ?>
+  AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
+<? elseif exists("custtype_pattern") ?>
+  AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
+<? endif ?>
+      )
+<? else ?>
+-- New mode
+SELECT currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied
+FROM cashrcpt JOIN cust ON (cust_id=cashrcpt_cust_id) LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
+WHERE ( (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+<? if exists("cust_id") ?>
+  AND   (cust_id=<? value("cust_id") ?>)
+<? elseif exists("custtype_id") ?>
+  AND   (cust_custtype_id=<? value("custtype_id") ?>)
+<? elseif exists("custgrp_id") ?>
+  AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
+<? elseif exists("custtype_pattern") ?>
+  AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
+<? endif ?>
+      )
+<? endif ?>
+) data
+;
+

 --------------------------------------------------------------------
 REPORT: EmployeeList
 QUERY: detail
 SELECT e.emp_id, m.emp_id, warehous_code, e.emp_code, e.emp_number,
        cntct_first_name, cntct_last_name,
-       m.emp_code AS mgr_code, dept_number, shift_number
+       m.emp_code AS mgr_code, dept_number, shift_number,
+       CASE WHEN (e.emp_active) THEN 'Yes'
+            ELSE 'No'
+       END AS f_active
 FROM emp e
   LEFT OUTER JOIN cntct ON (emp_cntct_id=cntct_id)
   LEFT OUTER JOIN whsinfo ON (emp_warehous_id=warehous_id)
   LEFT OUTER JOIN emp m ON (e.emp_mgr_emp_id=m.emp_id)
   LEFT OUTER JOIN shift ON (e.emp_shift_id=shift_id)
   LEFT OUTER JOIN dept  ON (e.emp_dept_id=dept_id)
 WHERE ((LENGTH(TRIM(COALESCE(<? value("searchString") ?>,''))) = 0)
 <? if exists("searchCode") ?>
    OR (e.emp_code ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchDept") ?>
    OR (dept_number ~* <? value("searchString") ?>)
    OR (dept_name   ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchMgr") ?>
    OR (m.emp_code   ~* <? value("searchString") ?>)
    OR (m.emp_number ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchNumber") ?>
    OR (e.emp_number ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchName") ?>
    OR (cntct_first_name ~* <? value("searchString") ?>)
    OR (cntct_last_name   ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchShift") ?>
    OR (shift_number ~* <? value("searchString") ?>)
    OR (shift_name   ~* <? value("searchString") ?>)
 <? endif ?>
       )
 <? if exists("activeOnly") ?>
    AND e.emp_active
 <? endif ?>
 <? if exists("warehouse_id") ?>
    AND (warehous_id=<? value("warehouse_id") ?>)
 <? endif ?>
 ORDER BY emp_code;


 --------------------------------------------------------------------
 REPORT: ExpiredInventoryByClassCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          (SELECT (classcode_code || '-' || classcode_descrip)
             FROM classcode
            WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? else ?>
          text('All Class Codes')
        <? endif ?>
        AS classcode,
        <? if exists("perishability") ?>
        'Perishability'
        <? else ?>
        'Warranty'
        <? endif ?> AS expiretype,
        <? if exists("showValue") ?>
-           <? if exists("useActualCosts") ?>
+           <? if exists("useActualCost") ?>
              text('Show Inventory Value with Actual Costs')
-           <? elseif exists("useStandardCosts") ?>
+           <? elseif exists("useStandardCost") ?>
              text('Show Inventory Value with Standard Costs')
            <? else ?>
              text('Show Inventory Value with Posted Costs')
            <? endif ?>
            AS showvalues,
            text('Unit Cost') AS f_unitcost,
            text('Value') AS f_value,
        <? else ?>
            text('') AS showvalues,
            text('') AS f_unitcost,
            text('') AS f_value,
        <? endif ?>
        int4(<? value("thresholdDays") ?>) AS f_thresholddays;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        ls_number AS itemloc_lotserial,
        formatQty(itemloc_qty) AS f_qoh,
        formatDate(itemloc_expiration) AS f_expiration,
        <? if exists("showValue") ?>
          formatCost(cost)
        <? else ?>
          text('')
        <? endif ?>
        AS f_unitcost,
        noNeg(cost * itemloc_qty) AS value,
        <? if exists("showValue") ?>
          formatExtPrice(noNeg(cost * itemloc_qty))
        <? else ?>
          text('')
        <? endif ?>
        AS f_value
   FROM ( SELECT itemsite_id,
                 warehous_code,
                 item_number,
                 item_descrip1,
                 item_descrip2,
                 uom_name,
                 ls_number,
                 itemloc_qty,
 <? if exists("perishability") ?>
                 itemloc_expiration,
 <? elseif exists("warranty") ?>
                 itemloc_warrpurc AS itemloc_expiration,
 <? endif ?>
-                <? if exists("useActualCosts") ?>
+                <? if exists("useActualCost") ?>
                   actcost(itemsite_item_id)
-                <? elseif exists("useStandardCosts") ?>
+                <? elseif exists("useStandardCost") ?>
                   stdcost(itemsite_item_id)
                 <? else ?>
                   (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
                 <? endif ?>
                 AS cost
            FROM itemloc, itemsite, item, warehous, uom, ls
           WHERE ((itemloc_itemsite_id=itemsite_id)
             AND (itemloc_ls_id=ls_id)
             AND (itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (itemsite_warehous_id=warehous_id)
 <? if exists("perishability") ?>
             AND (itemsite_perishable)
             AND (itemloc_expiration < (CURRENT_DATE + <? value("thresholdDays") ?>))
 <? elseif exists("warranty") ?>
             AND (itemsite_warrpurc)
             AND (itemloc_warrpurc < (CURRENT_DATE + <? value("thresholdDays") ?>))
 <? endif ?>
 <? if exists("warehous_id") ?>
             AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
             AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
             AND (item_classcode_id IN (SELECT classcode_id
                                          FROM classcode
                                         WHERE classcode_code ~ <? value("classcode_pattern") ?>) )
 <? endif ?>
                 )
        ) AS data
 ORDER BY warehous_code,
 <? if exists("orderByInventoryValue") ?>
   value DESC
 <? elseif exists("orderByExpirationDate") ?>
   itemloc_expiration
 <? else ?>
   item_number
 <? endif ?>


 --------------------------------------------------------------------
 REPORT: GLTransactions
 QUERY: detail
 <? if exists("beginningBalance") ?>
 SELECT -1 AS gltrans_id,
        <? value("startDate") ?> AS gltrans_created, formatDate(<? value("startDate") ?>) AS transdate,
        '' AS gltrans_source, '' AS gltrans_doctype, '' AS gltrans_docnumber, '' AS invhist_docnumber,
        'Beginning Balance' AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
                      formatMoney(ABS(<? value("beginningBalance") ?>))
             ELSE ''
        END AS f_debit,
        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
                      ABS(<? value("beginningBalance") ?>)
             ELSE 0
        END AS debit_amt,

        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
                      formatMoney(ABS(<? value("beginningBalance") ?>))
             ELSE ''
        END AS f_credit,
        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
                      ABS(<? value("beginningBalance") ?>)
             ELSE 0
        END AS credit_amt,
        <? value("beginningBalance") ?> * -1 AS balance_amt,
        <? value("beginningBalance") ?> AS gltrans_amount,
        <? value("beginningBalance") ?> AS running,
        NULL AS f_posted,
        NULL AS f_username,
        -1 AS gltrans_sequence
  FROM accnt
  WHERE (accnt_id=<? value("accnt_id") ?>)
 UNION
 <? endif ?>

 SELECT gltrans_id,
        gltrans_created, formatDate(gltrans_date) AS transdate,
        gltrans_source, gltrans_doctype, gltrans_docnumber, invhist_docnumber,
        firstLine(gltrans_notes) AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
 -- Debits:
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(ABS(gltrans_amount))
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount < 0) THEN ABS(gltrans_amount)
             ELSE 0
        END AS debit_amt,
 --Credits:
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        CASE WHEN (gltrans_amount > 0) THEN gltrans_amount
             ELSE 0
        END AS credit_amt,
 --Balance:
        gltrans_amount * -1 as balance_amt,
 --
        gltrans_amount,
        CASE WHEN accnt_type IN ('A','E') THEN
          gltrans_amount * -1
        ELSE gltrans_amount END AS running,
        formatBoolYN(gltrans_posted) AS f_posted,
        gltrans_username AS f_username,
        gltrans_sequence
-  FROM gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
-       LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id AND gltrans_docnumber='Misc.')
- WHERE ((gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+FROM gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
+     LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id
+                            AND gltrans_docnumber='Misc.')
+<? if exists("company_id") ?>
+     JOIN company ON (accnt_company=company_number)
+<? endif ?>
+<? if exists("prfcntr_id") ?>
+     JOIN prftcntr ON (accnt_profit=prftcntr_number)
+<? endif ?>
+<? if exists("subaccnt_id") ?>
+     JOIN subaccnt ON (accnt_sub=subaccnt_number)
+<? endif ?>
+<? if exists("subType") ?>
+     JOIN subaccnttype ON (subaccnttype_code=accnt_subaccnttype_code)
+<? endif ?>
+WHERE (
+<? if exists("startDate") ?>
+  <? if exists("endDate") ?>
+       (gltrans_date BETWEEN <? value("startDate") ?>
+                         AND <? value("endDate") ?>)
+  <? else ?>
+       (gltrans_date BETWEEN <? value("startDate") ?>
+                         AND endoftime())
+  <? endif ?>
+<? else ?>
+  <? if exists("endDate") ?>
+       (gltrans_date BETWEEN startoftime()
+                         AND <? value("endDate") ?>)
+  <? else ?>
+       (gltrans_date BETWEEN startoftime()
+                         AND endoftime())
+  <? endif ?>
+<? endif ?>
+<? if exists("company_id") ?>
+   AND (company_id=<? value("company_id") ?>)
+<? endif ?>
+<? if exists("prfcntr_id") ?>
+   AND (prftcntr_id=<? value("prfcntr_id") ?>)
+<? endif ?>
+<? if exists("accnt_number") ?>
+   AND (accnt_number=<? value("accnt_number") ?>)
+<? endif ?>
+<? if exists("subaccnt_id") ?>
+   AND (subaccnt_id=<? value("subaccnt_id") ?>)
+<? endif ?>
+<? if exists("subType") ?>
+   AND (subaccnttype_id=<? value("subType") ?>)
+<? endif ?>
+<? if exists("accntType") ?>
+   AND (accnt_type= <? value("accntType") ?>)
+<? endif ?>
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
 <? if exists("docnum") ?>
-   AND (gltrans_docnumber = case when <? value("docnum") ?> = '' then gltrans_docnumber else <? value("docnum") ?> end )
+   AND (gltrans_docnumber = case when <? value("docnum") ?> = '' then
+ gltrans_docnumber else
+<? value("docnum") ?> end )
 <? endif ?>
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_created <? if not exists("beginningBalance") ?> DESC <? endif ?>,
         gltrans_sequence, gltrans_amount

 ;


 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityBySourceVendor
 QUERY: head
-SELECT <? if exists("warehouse_id") ?>
+SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("byDays") ?>
          (text('Look ahead ') || text(<? value("byDays") ?>) || text(' days'))
        <? elseif exists("byDate") ?>
          (text('Cutoff date ') || formatDate(<? value("byDate") ?>))
        <? elseif exists("byDates") ?>
          (text('Dates from ') || formatDate(<? value("startDate") ?>) || text(' to ') || formatDate(<? value("endDate") ?>))
        <? else ?>
          text('Item Site Lead Time')
        <? endif ?>
        AS ltcriteria,
 <? if exists("vend_id") ?>
        text('Vendor:') AS vend_label,
        vend_name AS vend_value
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
        text('Vendor Type:') AS vend_label,
        vendtype_code AS vend_value
   FROM vendtype
  WHERE (vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
        text('Vendor Type:') AS vend_label,
        text(<? value("vendtype_pattern") ?>) AS vend_value
 <? else ?>
        text('Vendor:') AS vend_label,
        text('All Vendors') AS vend_value
 <? endif ?>


 --------------------------------------------------------------------
 REPORT: InvoiceInformation
 QUERY: GroupHead
 SELECT invchead_id, invchead_ponumber,
        formatDate(invchead_shipdate) AS f_shipdate,
        formatDate(invchead_invcdate) AS f_invcdate,
-       formatMoney((invchead_tax + invchead_misc_amount + invchead_freight + SUM(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)))) AS f_amount,
+       formatMoney(invoiceTotal(invchead_id)) AS f_amount,
        invchead_billto_name, invchead_billto_address1,
        invchead_billto_address2, invchead_billto_address3,
        ( invchead_billto_city || ' ' || invchead_billto_state || ', '
          || invchead_billto_zipcode ) AS billtocitystatezip,
        invchead_shipto_name, invchead_shipto_address1,
        invchead_shipto_address2, invchead_shipto_address3,
        ( invchead_shipto_city || ' ' || invchead_shipto_state || ', '
          || invchead_shipto_zipcode ) AS shiptocitystatezip,
        invchead_notes, invchead_invcnumber
 FROM invchead LEFT OUTER JOIN (invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id) ) ON (invcitem_invchead_id=invchead_id)
 WHERE (invchead_id=<? value("invchead_id") ?>)
 GROUP BY invchead_id, invchead_ponumber,
          invchead_shipdate, invchead_invcdate,
          invchead_misc_amount, invchead_freight, invchead_tax,
          invchead_billto_name, invchead_billto_address1,
          invchead_billto_address2, invchead_billto_address3,
          invchead_billto_city, invchead_billto_state, invchead_billto_zipcode,
          invchead_shipto_name, invchead_shipto_address1,
          invchead_shipto_address2, invchead_shipto_address3,
          invchead_shipto_city, invchead_shipto_state, invchead_shipto_zipcode,
          invchead_notes, invchead_invcnumber;


 --------------------------------------------------------------------
 REPORT: ItemMaster
 QUERY: head
 SELECT item_number,
        formatBoolYN(item_active) AS f_item_active,
        item_descrip1, item_descrip2,
        CASE WHEN(item_type='P') THEN 'Purchased'
             WHEN(item_type='M') THEN 'Manufactured'
             WHEN(item_type='J') THEN 'Job'
             WHEN(item_type='F') THEN 'Phantom'
             WHEN(item_type='B') THEN 'Breeder'
             WHEN(item_type='C') THEN 'Co-Product'
             WHEN(item_type='Y') THEN 'By-Product'
             WHEN(item_type='R') THEN 'Reference'
             WHEN(item_type='T') THEN 'Tooling'
             WHEN(item_type='O') THEN 'Outside Process'
+            WHEN(item_type='K') THEN 'Kit'
             ELSE item_type
        END AS f_item_type,
        formatBoolYN(item_config) AS f_item_config,
        (classcode_code||' - '||classcode_descrip) AS f_classcode,
        CASE WHEN (COALESCE(freightclass_id, -1) <> -1) THEN (freightclass_code||' - '||freightclass_descrip) END AS f_freightclass,
        iuom.uom_name AS invuom,
        formatBoolYN(item_picklist) AS f_item_picklist,
        formatBoolYN(item_fractional) AS f_item_fractional,
        itemcapuom(item_id) AS capuom, itemaltcapuom(item_id) AS altcapuom, puom.uom_name AS shipuom,
        formatUOMRatio(itemcapinvrat(item_id)) AS f_capinvrat,
        formatUOMRatio(itemaltcapinvrat(item_id)) AS f_altcapinvrat,
        formatUOMRatio(iteminvpricerat(item_id)) AS f_shipinvrat,
        formatWeight(item_prodweight) AS f_item_prodweight,
        formatWeight(item_packweight) AS f_item_packweight,
        formatBoolYN(item_sold) AS f_item_sold
   FROM item JOIN classcode ON (classcode_id=item_classcode_id)
             JOIN uom iuom ON (iuom.uom_id=item_inv_uom_id)
             JOIN uom puom ON (puom.uom_id=item_price_uom_id)
             LEFT OUTER JOIN freightclass ON (freightclass_id=item_freightclass_id)
  WHERE (item_id=<? value("item_id") ?>)
 ;


 --------------------------------------------------------------------
 REPORT: PurchasePriceVariancesByItem
 QUERY: detail
-SELECT porecv_id, porecv_ponumber, vend_name,
-       formatDate(porecv_date) as f_date,
-       firstLine(porecv_vend_item_number) as f_itemnum,
-       firstLine(porecv_vend_item_descrip) as f_itemdescrip,
-       formatQty(porecv_qty) as f_qty,
-       formatPrice(porecv_purchcost) as f_purchcost,
-       formatPurchPrice(SUM(vodist_amount) / vodist_qty) AS f_vouchcost,
-       formatPrice(porecv_recvcost) as f_recvcost
-  FROM vend, itemsite, porecv
-       LEFT OUTER JOIN
-       ( vodist JOIN vohead
-         ON (vodist_vohead_id=vohead_id and vohead_posted)
-       ) ON ( (vodist_poitem_id=porecv_poitem_id) AND (vodist_vohead_id=porecv_vohead_id) )
- WHERE ( (porecv_vend_id=vend_id)
-   AND (porecv_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=<? value("item_id") ?>)
-   AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
-   AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
- )
-GROUP BY porecv_id, porecv_ponumber, vend_name, porecv_date, porecv_vend_item_number,
-         porecv_vend_item_descrip, porecv_qty, porecv_purchcost, porecv_recvcost,
-         vodist_qty
-ORDER BY porecv_date DESC;
+== MetaSQL statement poPriceVariances-detail


 --------------------------------------------------------------------
 REPORT: PurchasePriceVariancesByVendor
 QUERY: head
-SELECT vend_name,
-       vend_number,
-       formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
+SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
-       AS agentUsername
-  FROM vend
- WHERE (vend_id=<? value("vend_id") ?>);
+       AS agentUsername;
 --------------------------------------------------------------------

 QUERY: detail
-SELECT porecv_id, porecv_ponumber,
-       formatDate(porecv_date) as f_date,
-       COALESCE(item_number, ('NonInv - ' || porecv_vend_item_number)) as f_itemnum,
-       COALESCE(item_descrip1, porecv_vend_item_descrip) as f_itemdescrip,
-       formatQty(porecv_qty) as f_qty,
-       formatPrice(porecv_purchcost) as f_purchcost,
-       formatPurchPrice(SUM(vodist_amount) / vodist_qty) AS f_vouchcost,
-       formatPrice(porecv_recvcost) as f_recvcost
-  FROM vend,
-       porecv LEFT OUTER JOIN
-       ( itemsite JOIN item
-         ON (itemsite_item_id=item_id)
-       ) ON (porecv_itemsite_id=itemsite_id)
-       LEFT OUTER JOIN
-       ( vodist JOIN vohead
-         ON (vodist_vohead_id=vohead_id and vohead_posted)
-       ) ON ( (vodist_poitem_id=porecv_poitem_id) AND (vodist_vohead_id=porecv_vohead_id) )
- WHERE ( (porecv_vend_id=vend_id)
-   AND (vend_id=<? value("vend_id") ?>)
-   AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
-   AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
- )
-GROUP BY porecv_id, porecv_ponumber, porecv_date, item_number, porecv_vend_item_number,
-         item_descrip1, porecv_vend_item_descrip, porecv_qty, porecv_purchcost, porecv_recvcost,
-         vodist_qty
-ORDER BY porecv_date DESC;
+== MetaSQL statement poPriceVariances-detail
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: QOHByParameterList
 QUERY: head
 SELECT <? if exists("classcode") ?>
          text('Quantities on Hand by Class Code')
        <? elseif exists("classcode_id") ?>
          text('Quantities on Hand by Class Code')
        <? elseif exists("classcode_pattern") ?>
          text('Quantities on Hand by Class Code')
        <? elseif exists("itemgrp") ?>
          text('Quantities on Hand by Item Group')
        <? elseif exists("itemgrp_id") ?>
          text('Quantities on Hand by Item Group')
        <? elseif exists("itemgrp_pattern") ?>
          text('Quantities on Hand by Item Group')
        <? else ?>
          text('')
        <? endif ?>
        AS title,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          ( SELECT (classcode_code||'-'||classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? elseif exists("itemgrp_id") ?>
          ( SELECT (itemgrp_name|| '-'||itemgrp_descrip)
              FROM itemgrp
             WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
        <? elseif exists("itemgrp_pattern") ?>
          text(<? value("itemgrp_pattern") ?>)
        <? elseif exists("itemgrp") ?>
          text('All Item Groups')
        <? else ?>
-         text('')
+         text('All')
        <? endif ?>
        AS value,
        <? if exists("classcode") ?>
          text('Class Code:')
        <? elseif exists("classcode_id") ?>
          text('Class Code:')
        <? elseif exists("classcode_pattern") ?>
          text('Class Codes:')
        <? elseif exists("itemgrp") ?>
          text('Item Group:')
        <? elseif exists("itemgrp_id") ?>
          text('Item Group:')
        <? elseif exists("itemgrp_pattern") ?>
          text('Item Groups:')
        <? else ?>
          text('')
        <? endif ?>
        AS label,
        <? if exists("onlyShowPositive") ?>
          text('Only Showing Positive Quantities')
        <? elseif exists("onlyShowNegative") ?>
          text('Only Showing Negative Quantities')
        <? else ?>
          text('Showing All Quantities')
        <? endif ?>
        AS showquantities,
        <? if exists("showValue") ?>
          text('Unit Cost') AS lbl_unitcost,
          text('Value') AS lbl_value,
          text('NN Value') AS lbl_nnvalue,
          text('Cost Method') AS lbl_costmethod,
        <? else ?>
          text('') AS lbl_unitcost,
          text('') AS lbl_value,
          text('') AS lbl_nnvalue,
          text('') AS lbl_costmethod,
        <? endif ?>
        <? if exists("showValue") ?>
          <? if exists("useActualCosts") ?>
            text('Showing Actual Costs')
          <? elseif exists("useStandardCosts") ?>
            text('Showing Standard Costs')
          <? else ?>
            text('Showing Posted Costs')
          <? endif ?>
        <? else ?>
          text('')
        <? endif ?>
        AS showvalues;


 --------------------------------------------------------------------
 REPORT: Statement
 QUERY: detail
-SELECT CASE WHEN (aropen_doctype='I') THEN 'Invc.'
-            WHEN (aropen_doctype='D') THEN 'D/M'
-            WHEN (aropen_doctype='C') THEN 'C/M'
-            WHEN (aropen_doctype='R') THEN 'C/D'
+SELECT CASE WHEN (araging_doctype = 'I') THEN <? value("invoice") ?>
+            WHEN (araging_doctype = 'D') THEN <? value("debit") ?>
+            WHEN (araging_doctype = 'C') THEN <? value("credit") ?>
+            WHEN (araging_doctype = 'R') THEN <? value("deposit") ?>
             ELSE 'Misc.'
        END AS doctype,
-       aropen_docnumber, formatDate(aropen_docdate) AS f_docdate,
-       CASE WHEN (aropen_doctype='I') THEN formatDate(aropen_duedate)
+       araging_docnumber AS f_docnumber,
+       formatDate(CAST(araging_docdate AS DATE)) AS f_docdate,
+       CASE WHEN (araging_doctype IN ('I','D')) THEN formatDate(araging_duedate)
             ELSE ''
        END AS f_duedate,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_amount,aropen_docdate))
-            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount * -1),aropen_docdate))
-            ELSE formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_amount,aropen_docdate))
-       END AS f_amount,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_paid,aropen_docdate))
-            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_paid * -1),aropen_docdate))
-            ELSE formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_paid,aropen_docdate))
-       END AS f_applied,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate))
-            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid) * -1,aropen_docdate))
-            ELSE formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate))
-       END AS f_balance,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate)
-            WHEN (aropen_doctype IN ('C', 'R')) THEN currtocurr(aropen_curr_id,cust_curr_id,((aropen_amount - aropen_paid) * -1),aropen_docdate)
-            ELSE currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate)
-       END AS balance
-FROM aropen, cust
-WHERE ( (aropen_cust_id=cust_id)
- AND (aropen_cust_id=<? value("cust_id") ?>)
- AND (aropen_open)
- AND ((aropen_amount - aropen_paid) > 0) )
-ORDER BY aropen_docdate;
-
-
+       formatMoney(araging_aropen_amount) AS f_amount,
+       formatMoney(araging_aropen_amount - araging_total_val) AS f_applied,
+       formatMoney(araging_total_val) AS f_balance
+FROM araging(<? value("asofdate") ?>, true)
+WHERE ((araging_cust_id = <? value("cust_id") ?>)
+   AND (abs(araging_aropen_amount) > 0)
+      )
+ORDER BY araging_duedate;
 --------------------------------------------------------------------

 QUERY: head
 SELECT cust_name, cust_address1, cust_address2, cust_address3,
-       (cust_city || '  ' || cust_state || '  ' || cust_zipcode) AS citystatezip
+       (cust_city || '  ' || cust_state || '  ' || cust_zipcode) AS citystatezip,
+       formatDate(COALESCE(<? value("asofdate") ?>, current_date)) AS asofdate
 FROM cust
 WHERE (cust_id=<? value("cust_id") ?>);
---------------------------------------------------------------------
-
-QUERY: Current
-SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen, cust
- WHERE ((aropen_cust_id=cust_id)
-   AND (aropen_cust_id=<? value("cust_id") ?>)
-   AND (aropen_open)
-   AND ((aropen_amount - aropen_paid) > 0)
-   AND (aropen_duedate >= CURRENT_DATE) )
---------------------------------------------------------------------
-
-QUERY: Past91Plus
-SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen, cust
- WHERE ((aropen_cust_id=cust_id)
-   AND (aropen_cust_id=<? value("cust_id") ?>)
-   AND (aropen_open)
-   AND ((aropen_amount - aropen_paid) > 0)
-   AND (aropen_duedate <= (CURRENT_DATE - 91)) )
---------------------------------------------------------------------
-
-QUERY: Past1to30
-SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen, cust
- WHERE ((aropen_cust_id=cust_id)
-   AND (aropen_cust_id=<? value("cust_id") ?>)
-   AND (aropen_open)
-   AND ((aropen_amount - aropen_paid) > 0)
-   AND (aropen_duedate between (CURRENT_DATE - 30) AND (CURRENT_DATE - 1)) )
---------------------------------------------------------------------
-
-QUERY: Past31to60
-SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen, cust
- WHERE ((aropen_cust_id=cust_id)
-   ANd (aropen_cust_id=<? value("cust_id") ?>)
-   AND (aropen_open)
-   AND ((aropen_amount - aropen_paid) > 0)
-   AND (aropen_duedate between (CURRENT_DATE - 60) AND (CURRENT_DATE - 31)) )
---------------------------------------------------------------------
-
-QUERY: Past61to90
-SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen, cust
- WHERE ((aropen_cust_id=cust_id)
-   ANd (aropen_cust_id=<? value("cust_id") ?>)
-   AND (aropen_open)
-   AND ((aropen_amount - aropen_paid) > 0)
-   AND (aropen_duedate between (CURRENT_DATE - 90) AND (CURRENT_DATE - 61)) )
-WHERE (cust_id = <? value("cust_id") ?>);
 --------------------------------------------------------------------

+QUERY: foot
+SELECT formatMoney(SUM(araging_cur_val)) AS f_current,
+       formatMoney(SUM(araging_thirty_val)) AS f_thirty,
+       formatMoney(SUM(araging_sixty_val)) AS f_sixty,
+       formatMoney(SUM(araging_ninety_val)) AS f_ninety,
+       formatMoney(SUM(araging_plus_val)) AS f_plus,
+       formatMoney(SUM(araging_total_val)) AS f_total
+FROM araging(<? value("asofdate") ?>, true)
+WHERE ((abs(araging_aropen_amount) > 0)
+   AND (araging_cust_id = <? value("cust_id") ?>));
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: TodoByUserAndIncident
 QUERY: dates
+SELECT
+  formatDate(<? value("start_date_start") ?>,'Earliest') AS f_startDateStart,
+  formatDate(<? value("start_date_end") ?>  ,'Latest')   AS f_endDateStart,
+  formatDate(<? value("due_date_start") ?>  ,'Earliest') AS f_startDateDue,
+  formatDate(<? value("due_date_end") ?>    ,'Latest')   AS f_endDateDue
+;
+
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: UsageStatisticsByClassCode
 QUERY: detail
-SELECT warehous_code,
-       item_number,
-       item_descrip1,
-       item_descrip2,
-       formatQty(summTransR(itemsite_id, <? value("startDate") ?>, <? value("endDate")?>)) AS f_received,
-       formatQty(summTransI(itemsite_id, <? value("startDate") ?>, <? value("endDate")?>)) AS f_issued,
-       formatQty(summTransS(itemsite_id, <? value("startDate") ?>, <? value("endDate")?>)) AS f_sold,
-       formatQty(summTransC(itemsite_id, <? value("startDate") ?>, <? value("endDate")?>)) AS f_scrap,
-       formatQty(summTransA(itemsite_id, <? value("startDate") ?>, <? value("endDate")?>)) AS f_adjustments
-  FROM item, itemsite, warehous
- WHERE ((itemsite_item_id=item_id)
-   AND (itemsite_warehous_id=warehous_id)
-<? if exists("classcode_id") ?>
-   AND (item_classcode_id=<? value("classcode_id") ?>)
-<? elseif exists("classcode_pattern") ?>
-   AND (item_classcode_id IN (SELECT classcode_id
-                                FROM classcode
-                               WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
-<? endif ?>
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-)
-ORDER BY warehous_code, item_number;
-
+== MetaSQL statement usageStatistics-detail
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UsageStatisticsByItemGroup
 QUERY: detail
-SELECT warehous_code,
-       item_number,
-       item_descrip1,
-       item_descrip2,
-       formatQty(summTransR(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_received,
-       formatQty(summTransI(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_issued,
-       formatQty(summTransS(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_sold,
-       formatQty(summTransC(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_scrap,
-       formatQty(summTransA(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_adjustments
-  FROM item, itemsite, warehous, itemgrp, itemgrpitem
- WHERE ((itemsite_item_id=item_id)
-   AND (itemsite_warehous_id=warehous_id)
-   AND (itemgrpitem_itemgrp_id=itemgrp_id)
-   AND (itemgrpitem_item_id=item_id)
-<? if exists("itemgrp_id") ?>
-   AND (itemgrp_id=<? value("itemgrp_id") ?>)
-<? elseif exists("itemgrp_pattern") ?>
-   AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>)
-<? endif ?>
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-)
-ORDER BY warehous_code, item_number;
-
+== MetaSQL statement usageStatistics-detail
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UsageStatisticsByItem
 QUERY: detail
-SELECT itemsite_id,
-       warehous_code,
-       formatQty(summTransR(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_received,
-       formatQty(summTransI(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_issued,
-       formatQty(summTransS(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_sold,
-       formatQty(summTransC(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_scrap,
-       formatQty(summTransA(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_adjustments
-  FROM itemsite, warehous
- WHERE ((itemsite_warehous_id=warehous_id)
-   AND (itemsite_item_id=<? value("item_id") ?>)
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-)
-ORDER BY warehous_code;
-
+== MetaSQL statement usageStatistics-detail
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UsageStatisticsByWarehouse
 QUERY: detail
-SELECT itemsite_id,
-       item_number,
-       item_descrip1,
-       item_descrip2,
-       formatQty(summTransR(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_received,
-       formatQty(summTransI(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_issued,
-       formatQty(summTransS(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_sold,
-       formatQty(summTransC(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_scrap,
-       formatQty(summTransA(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>)) AS f_adjustments
-  FROM item, itemsite
- WHERE ((itemsite_item_id=item_id)
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-)
-ORDER BY item_number;
-
+== MetaSQL statement usageStatistics-detail
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByComponentItem
 QUERY: detail
-SELECT formatWONumber(wo_id) AS wonumber,
-               item_number, item_descrip1, item_descrip2,
-               CASE WHEN (womatl_issuemethod='S') THEN 'Push'
-                         WHEN (womatl_issuemethod='L') THEN 'Pull'
-                         WHEN (womatl_issuemethod='M') THEN 'Mixed'
-                         ELSE 'Error'
-                END AS issuemethod,
-                uom_name,
-                formatQty(womatl_qtyfxd) AS qtyfxd,
-                formatQty(womatl_qtyper) AS qtyper,
-                formatScrap(womatl_scrap) AS scrappercent,
-                formatQty(womatl_qtyreq) AS required,
-                formatQty(womatl_qtyiss) AS issued,
-                formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS balance,
-                formatDate(womatl_duedate) AS duedate
-    FROM wo, womatl, itemsite AS parentsite, itemsite AS componentsite, item, uom
-WHERE ((womatl_wo_id=wo_id)
-       AND (womatl_uom_id=uom_id)
-       AND (wo_status <> 'C')
-       AND (wo_itemsite_id=parentsite.itemsite_id)
-       AND (womatl_itemsite_id=componentsite.itemsite_id)
-       AND (parentsite.itemsite_item_id=item_id)
-       AND (componentsite.itemsite_item_id=<? value("item_id") ?>)
-<? if exists("warehous_id") ?>
-       AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
- )
-ORDER BY wo_startdate;
+== MetaSQL statement workOrderMaterial-detail


 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByWorkOrder
 QUERY: detail
-SELECT womatl_id, item_number,
-       item_descrip1, item_descrip2,
-       CASE WHEN (womatl_issuemethod = 'S') THEN 'Push'
-            WHEN (womatl_issuemethod = 'L') THEN 'Pull'
-            WHEN (womatl_issuemethod = 'M') THEN 'Mixed'
-            ELSE 'Error'
-       END AS issuemethod,
-       uom_name,
-       formatQty(womatl_qtyfxd) AS qtyfxd,
-       formatQtyper(womatl_qtyper) AS qtyper,
-       formatScrap(womatl_scrap) AS scrappercent,
-       formatQty(womatl_qtyreq) AS required,
-       formatQty(womatl_qtyiss) AS issued,
-       formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS balance,
-       formatDate(womatl_duedate) AS duedate
-FROM wo, womatl, itemsite, item, uom
-WHERE ((womatl_wo_id=wo_id)
- AND (womatl_uom_id=uom_id)
- AND (womatl_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (wo_id=<? value("wo_id") ?>) )
-ORDER BY item_number;
+== MetaSQL statement workOrderMaterial-detail
