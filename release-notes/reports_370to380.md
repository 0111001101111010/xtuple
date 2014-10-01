--------------------------------------------------------------------
REMOVED REPORTS:
BillingEditList
CashReceiptsJournal
CheckJournal
CreditMemoJournal
IncidentsByCRMAccount
PayablesJournal
SalesJournal
SalesJournalByDate
TodoByUserAndIncident
VoucheringEditList
--------------------------------------------------------------------
NEW REPORTS:
UnpostedVouchers
--------------------------------------------------------------------
CHANGED REPORTS:
Backlog
CashReceipts
CostedIndentedBOM
FinancialReport
GLSeries
InventoryAvailabilityByCustomerType
Invoice
ItemCostDetail
ItemCostSummary
MetaSQLMasterList
POsByDate
PickingListSONoClosedLines
PricingScheduleAssignments
PurchaseOrder
QOH
ReportsMasterList
RunningAvailability
Statement
SummarizedBankrecHistory
SummarizedSalesHistory
TimePhasedBookings
TimePhasedSalesHistory
VendorInformation
WOLabel
Items


 --------------------------------------------------------------------
 REPORT: Backlog
 QUERY: detail
 SELECT cohead_number, coitem_linenumber, cust_name,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
        item_number, uom_name,
        item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        CASE WHEN (checkPrivilege('ViewCustomerPrices')) THEN
 formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
                 * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2))
        ELSE
          text('')
        END
        AS f_ammount,
        CASE WHEN (checkPrivilege('ViewCustomerPrices') AND isMultiCurr()) THEN
 formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
                 * (coitem_price / coitem_price_invuomratio),2))
        ELSE
          text('')
        END
        AS foreign_ammount,
 round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
     * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2) AS backlog
   FROM cohead, coitem, itemsite, item, cust, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status='O')
   <? if exists("cohead_id") ?>
     AND  (coitem_cohead_id=<? value("cohead_id") ?>)
   <? endif ?>
   <? if exists("startDate") ?>
     AND  (cohead_orderdate >= <? value("startDate") ?>)
   <? endif ?>
   <? if exists("endDate") ?>
     AND  (cohead_orderdate <= <? value("endDate") ?>)
   <? endif ?>
   <? if exists("startDateSched") ?>
     AND  (coitem_scheddate >= <? value("startDateSched") ?>)
   <? endif ?>
   <? if exists("endDateSched") ?>
-    AND  (coitem_scheddate >= <? value("endDateSched") ?>)
+    AND  (coitem_scheddate <= <? value("endDateSched") ?>)
   <? endif ?>
   <? if exists("salesrep_id") ?>
     AND  (cohead_salesrep_id=<? value("salesrep_id") ?>)
   <? endif ?>
   <? if exists("shipto_id") ?>
     AND  (cohead_shipto_id=<? value("shipto_id") ?>)
   <? endif ?>
   <? if exists("cust_id") ?>
     AND  (cohead_cust_id=<? value("cust_id") ?>)
   <? endif ?>
   <? if exists("custtype_id") ?>
     AND  (cust_custtype_id=<? value("custtype_id") ?>)
   <? endif ?>
   <? if exists("custtype_pattern") ?>
     AND  (cust_custtype_id IN (SELECT DISTINCT custtype_id
                                FROM custtype
                                WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
   <? endif ?>
   <? if exists("custgrp") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrpitem))
   <? endif ?>
   <? if exists("custgrp_id") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrpitem
                      WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
   <? endif ?>
   <? if exists("custgrp_pattern") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrp, custgrpitem
                      WHERE ( (custgrpitem_custgrp_id=custgrp_id)
                        AND   (custgrp_name ~ <? value("custgrp_pattern") ?>) )) )
   <? endif ?>

   <? if exists("item_id") ?>
     AND  (itemsite_item_id=<? value("item_id") ?>)
   <? endif ?>
   <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
   <? endif ?>
   <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT DISTINCT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
   <? endif ?>

   <? if exists("warehous_id") ?>
     AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   <? endif ?>
 )
 ORDER BY coitem_scheddate, cohead_number, coitem_linenumber;

 --------------------------------------------------------------------
 REPORT: CashReceipts
 QUERY: detail
 == MetaSQL statement cashReceipts-detail
 --------------------------------------------------------------------

 QUERY: foot
 SELECT formatMoney(SUM(base_applied)) AS f_base_applied_total
 FROM (
 <? if exists("LegacyDisplayMode") ?>
 -- Posted cash receipts
 SELECT  currtobase(arapply_curr_id,arapply_applied,arapply_postdate) AS base_applied
 FROM cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), arapply
 WHERE ( (arapply_cust_id=cust_id)
   AND   (arapply_postdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
   AND   (arapply_source_doctype ='K')
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )

 -- Unposted cash receipts
 UNION ALL
 SELECT currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied
 FROM cashrcpt, cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
 WHERE ( (NOT cashrcpt_posted)
   AND   (cashrcpt_cust_id=cust_id)
   AND   (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )

 -- Cash Advance
 UNION ALL
 SELECT aropen_amount / aropen_curr_rate AS base_applied
 FROM cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), aropen
   JOIN cashrcptitem ON (aropen_id=cashrcptitem_aropen_id)
 WHERE ( (aropen_cust_id=cust_id)
   AND   (aropen_doctype IN ('R','C'))
   AND   (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )
 <? else ?>
 -- New mode
-SELECT currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied
+SELECT (cashrcpt_amount / cashrcpt_curr_rate) AS base_applied
 FROM cashrcpt JOIN cust ON (cust_id=cashrcpt_cust_id) LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
 WHERE ( (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )
 <? endif ?>
 ) data
 ;

 --------------------------------------------------------------------
 REPORT: CostedIndentedBOM
 QUERY: head
 SELECT item_number,
        uom_name AS item_invuom,
        item_descrip1,
        item_descrip2,
        <? if exists("useActualCosts") ?>
-         text('Using Actual Costs')
+         text('Using Actual Costs') AS lbl_usecosts,
+         (SELECT formatCost(SUM(bomdata_actextendedcost))
+          FROM indentedbom(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
+          WHERE (bomdata_bomwork_level=1)) as t_extendedcost,
        <? else ?>
-         text('Using Standard Costs')
+         text('Using Standard Costs') AS lbl_usecosts,
+         (SELECT formatCost(SUM(bomdata_stdextendedcost))
+          FROM indentedbom(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
+          WHERE (bomdata_bomwork_level=1)) as t_extendedcost,
        <? endif ?>
-       AS lbl_usecosts,
-       (select formatCost(sum(extendedcost)) from
-(select CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_stdextendedcost
-            ELSE 0
-       END AS extendedcost,
-       bomdata_bomwork_level
-FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,0,0))foo) as t_extendedcost,
        formatCost(actcost(item_id)) AS f_actual,
        formatCost(stdcost(item_id)) AS f_standard
   FROM item JOIN uom ON (uom_id=item_inv_uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: FinancialReport
 QUERY: detail
 SELECT financialReport(<? value("flhead_id") ?>, period_id,<? value("interval") ?>,<? value("prj_id") ?>)
   FROM period
  WHERE (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      ));
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) || flgrp_name ) AS name,
        CASE WHEN(flgrp_summarize AND flgrp_showstart) THEN formatMoney(flrpt_beginning)
             ELSE NULL
        END AS beginning,
        CASE WHEN(flgrp_summarize AND flgrp_showdelta) THEN formatMoney(flrpt_debits)
             ELSE NULL
        END AS debits,
        CASE WHEN(flgrp_summarize AND flgrp_showdelta) THEN formatMoney(flrpt_credits)
             ELSE NULL
        END AS credits,
        CASE WHEN(flgrp_summarize AND flgrp_showend) THEN formatMoney(flrpt_ending)
             ELSE NULL
        END AS ending,
        CASE WHEN(flgrp_summarize AND flgrp_showbudget) THEN formatMoney(flrpt_budget)
             ELSE NULL
        END AS budget,
        CASE WHEN(flgrp_summarize AND flgrp_showdiff) THEN formatMoney(flrpt_diff)
             ELSE NULL
        END AS diff,
        CASE WHEN(flgrp_summarize AND flgrp_showcustom) THEN formatMoney(flrpt_custom)
             ELSE NULL
        END AS custom,
        CASE WHEN(flgrp_summarize AND flgrp_showstartprcnt) THEN formatPrcnt(flrpt_beginningprcnt)
             ELSE NULL
        END AS beginningprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showdeltaprcnt) THEN formatPrcnt(flrpt_debitsprcnt)
             ELSE NULL
        END AS debitsprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showdeltaprcnt) THEN formatPrcnt(flrpt_creditsprcnt)
             ELSE NULL
        END AS creditsprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showendprcnt) THEN formatPrcnt(flrpt_endingprcnt)
             ELSE NULL
        END AS endingprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showbudgetprcnt) THEN formatPrcnt(flrpt_budgetprcnt)
             ELSE NULL
        END AS budgetprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showdiffprcnt) THEN formatPrcnt(flrpt_diffprcnt)
             ELSE NULL
        END AS diffprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showcustomprcnt) THEN formatPrcnt(flrpt_customprcnt)
             ELSE NULL
        END AS customprcnt
   FROM flrpt, flgrp, period
  WHERE ((flrpt_type='G')
    AND  (flrpt_type_id=flgrp_id)
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
-   AND  (flrpt_username=CURRENT_USER)
+   AND  (flrpt_username=getEffectiveXtUser())
    AND  (flrpt_interval=<? value("interval") ?>)
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
 UNION
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) ||
          CASE WHEN(accnt_id IS NULL) THEN ('Unknown Account ID ' || flitem_accnt_id)
               ELSE (formatGLAccount(accnt_id) || '-' || accnt_descrip)
          END
        ) AS name,
        formatMoney(flrpt_beginning) AS beginning,
        formatMoney(flrpt_debits) AS debits,
        formatMoney(flrpt_credits) AS credits,
        formatMoney(flrpt_ending) AS ending,
        formatMoney(flrpt_budget) AS budget,
        formatMoney(flrpt_diff) AS diff,
        formatMoney(flrpt_custom) AS custom,
        formatPrcnt(flrpt_beginningprcnt) AS beginningprcnt,
        formatPrcnt(flrpt_debitsprcnt) AS debitsprcnt,
        formatPrcnt(flrpt_creditsprcnt) AS creditsprcnt,
        formatPrcnt(flrpt_endingprcnt) AS endingprcnt,
        formatPrcnt(flrpt_budgetprcnt) AS budgetprcnt,
        formatPrcnt(flrpt_diffprcnt) AS diffprcnt,
        formatPrcnt(flrpt_customprcnt) AS customprcnt
   FROM flrpt LEFT OUTER JOIN accnt ON (flrpt_accnt_id=accnt_id), flitem, period
  WHERE ((flrpt_type='I')
    AND  (flrpt_type_id=flitem_id)
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
-   AND  (flrpt_username=CURRENT_USER)
+   AND  (flrpt_username=getEffectiveXtUser())
    AND  (flrpt_interval=<? value("interval") ?>)
 <? if not exists("showzeros") ?>
    AND ((flrpt_beginning <> 0)
     OR (flrpt_debits <> 0)
     OR (flrpt_credits <> 0)
     OR (flrpt_ending <> 0)
     OR (flrpt_budget <> 0)
     OR (flrpt_diff <> 0)
     OR (flrpt_custom <> 0))
 <? endif ?>
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
 UNION
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) || flspec_name ) AS name,
        formatMoney(flrpt_beginning) AS beginning,
        formatMoney(flrpt_debits) AS debits,
        formatMoney(flrpt_credits) AS credits,
        formatMoney(flrpt_ending) AS ending,
        formatMoney(flrpt_budget) AS budget,
        formatMoney(flrpt_diff) AS diff,
        formatMoney(flrpt_custom) AS custom,
        formatPrcnt(flrpt_beginningprcnt) AS beginningprcnt,
        formatPrcnt(flrpt_debitsprcnt) AS debitsprcnt,
        formatPrcnt(flrpt_creditsprcnt) AS creditsprcnt,
        formatPrcnt(flrpt_endingprcnt) AS endingprcnt,
        formatPrcnt(flrpt_budgetprcnt) AS budgetprcnt,
        formatPrcnt(flrpt_diffprcnt) AS diffprcnt,
        formatPrcnt(flrpt_customprcnt) AS customprcnt
   FROM flrpt, flspec, period
  WHERE ((flrpt_type='S')
    AND  (flrpt_type_id=flspec_id)
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
-   AND  (flrpt_username=CURRENT_USER)
+   AND  (flrpt_username=getEffectiveXtUser())
    AND  (flrpt_interval=<? value("interval") ?>)
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
 UNION
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) ||
          CASE WHEN(flrpt_type='T' AND flrpt_level=0) THEN COALESCE(flrpt_altname,'Total')
               WHEN(flrpt_type='T') THEN COALESCE(flrpt_altname,'Subtotal')
               ELSE ('Type ' || flrpt_type || ' ' || text(flrpt_type_id))
          END
        ) AS name,
        formatMoney(flrpt_beginning) AS beginning,
        formatMoney(flrpt_debits) AS debits,
        formatMoney(flrpt_credits) AS credits,
        formatMoney(flrpt_ending) AS ending,
        formatMoney(flrpt_budget) AS budget,
        formatMoney(flrpt_diff) AS diff,
        formatMoney(flrpt_custom) AS custom,
        formatPrcnt(flrpt_beginningprcnt) AS beginningprcnt,
        formatPrcnt(flrpt_debitsprcnt) AS debitsprcnt,
        formatPrcnt(flrpt_creditsprcnt) AS creditsprcnt,
        formatPrcnt(flrpt_endingprcnt) AS endingprcnt,
        formatPrcnt(flrpt_budgetprcnt) AS budgetprcnt,
        formatPrcnt(flrpt_diffprcnt) AS diffprcnt,
        formatPrcnt(flrpt_customprcnt) AS customprcnt
   FROM flrpt, period
  WHERE ((NOT (flrpt_type IN ('G','I','S')))
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
-   AND  (flrpt_username=CURRENT_USER)
+   AND  (flrpt_username=getEffectiveXtUser())
    AND  (flrpt_interval=<? value("interval") ?>)
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
  ORDER BY period_start, flrpt_order;

 --------------------------------------------------------------------
 REPORT: GLSeries
 QUERY: detail
 <? if exists("gltrans") ?>
 SELECT gltrans_id,
        gltrans_sequence,
        formatDate(gltrans_date) AS transdate,
        gltrans_journalnumber,
        gltrans_source,
        gltrans_doctype,
        gltrans_docnumber,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        firstLine(gltrans_notes) AS f_notes,
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(gltrans_amount * -1)
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        formatBoolYN(gltrans_posted) AS f_posted
   FROM gltrans, accnt
  WHERE ((gltrans_accnt_id=accnt_id)
    AND (NOT gltrans_deleted)
+<? if exists("startDate") ?>
    AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+<? endif ?>
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
 <? if exists("startJrnlnum") ?>
    AND (gltrans_journalnumber BETWEEN <? value("startJrnlnum") ?> AND <? value("endJrnlnum") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_date, gltrans_sequence, gltrans_amount DESC;
 <? else ?>
 SELECT sltrans_id AS gltrans_id,
        sltrans_sequence AS gltrans_sequence,
        formatDate(sltrans_date) AS transdate,
        sltrans_journalnumber AS gltrans_journalnumber,
        sltrans_source AS gltrans_source,
        sltrans_doctype AS gltrans_doctype,
        sltrans_docnumber AS gltrans_docnumber,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        firstLine(sltrans_notes) AS f_notes,
        CASE WHEN (sltrans_amount < 0) THEN formatMoney(sltrans_amount * -1)
             ELSE ''
        END AS f_debit,
        CASE WHEN (sltrans_amount > 0) THEN formatMoney(sltrans_amount)
             ELSE ''
        END AS f_credit,
        formatBoolYN(sltrans_posted) AS f_posted
   FROM sltrans, accnt
  WHERE ((sltrans_accnt_id=accnt_id)
+<? if exists("startDate") ?>
    AND (sltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+<? endif ?>
 <? if exists("source") ?>
    AND (sltrans_source=<? value("source") ?>)
 <? endif ?>
 <? if exists("startJrnlnum") ?>
    AND (sltrans_journalnumber BETWEEN <? value("startJrnlnum") ?> AND <? value("endJrnlnum") ?>)
 <? endif ?>
        )
 ORDER BY sltrans_date, sltrans_sequence, sltrans_amount DESC;
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityByCustomerType
 QUERY: head
 SELECT
        <? if exists("onlyShowShortages") ?>
          text('Only Showing Shortages')
        <? else ?>
          text('')
        <? endif ?>
        AS f_onlyShowShortages,
       <? if exists("showWoSupply") ?>
          text('Show W/O Supply')
        <? else ?>
          text('')
        <? endif ?>
        AS f_showWoSupply,
-<? if exists(\"custtype_id\") ?>"
+<? if exists("custtype_id") ?>
        SELECT custtype_code from custtype where (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
        <? value("custtype_pattern") ?>
 <? else ?>
        text('All Customer Types')
 <? endif ?>
        AS f_custtype;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT itemsite_id, coitem_id,
        cohead_id, cohead_number, (cust_number||'-'||cust_name) AS custname,
        item_number, item_description, uom_name, item_picklist,
        qoh, formatQty(qoh) AS f_qoh,sobalance,
        formatQty(sobalance) AS f_sobalance,
        formatQty(allocated) AS f_allocated,
        ordered, formatQty(ordered) AS f_ordered,
        (qoh + ordered - sobalance) AS woavail,
 <? if exists("useReservationNetting") ?>
        formatQty(coitem_qtyreserved) AS f_soavail,
 <? else ?>
        formatQty(qoh + ordered - sobalance) AS f_soavail,
 <? endif ?>
        (qoh + ordered - allocated) AS totalavail,
        formatQty(qoh + ordered - allocated) AS f_totalavail,
        atshipping,formatQty(atshipping) AS f_atshipping,
        reorderlevel
 <? if exists(showWoSupply) ?>,
        wo_id,
        wo_status,
        wo_number,
        wo_ordered,
        CASE WHEN (wo_id = -1) THEN NULL ELSE formatQty(wo_ordered) END AS f_wo_ordered,
        formatdate(wo_startdate) AS f_wo_startdate,
        formatdate(wo_duedate) AS f_wo_duedate,
        COALESCE(wo_latestart,false) AS wo_latestart,
        COALESCE(wo_latedue,false) AS wo_latedue
 <? endif ?>
        FROM ( SELECT itemsite_id, coitem_id,
                      cohead_id, cohead_number, cust_number, cust_name,
                      item_number, (item_descrip1 || ' ' || item_descrip2) AS item_description,
                      uom_name, item_picklist,
                      noNeg(itemsite_qtyonhand) AS qoh,
                      noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) AS sobalance,
                      qtyAllocated(itemsite_id, coitem_scheddate) AS allocated,
                      qtyOrdered(itemsite_id, coitem_scheddate) AS ordered,
                      qtyatshipping(coitem_id) AS atshipping,
                      coitem_qtyreserved,
                      CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel
 <? if exists(showWoSupply) ?>,
                      COALESCE(wo_id,-1) AS wo_id,
                      formatwonumber(wo_id) AS wo_number,
                      noNeg((wo_qtyord-wo_qtyrcv)) AS wo_ordered,
                      wo_status, wo_startdate, wo_duedate,
                      ((wo_startdate <= CURRENT_DATE) AND (wo_status IN ('O','E','S','R'))) AS wo_latestart,
                      (wo_duedate<=CURRENT_DATE) AS wo_latedue
 <? endif ?>
                 FROM cohead, itemsite, item, uom, cust, coitem
 <? if exists(showWoSupply) ?>
                 LEFT OUTER JOIN wo
                   ON ((coitem_itemsite_id=wo_itemsite_id)
                   AND (wo_status IN ('E','R','I'))
                   AND (wo_qtyord-wo_qtyrcv > 0)
                   AND (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned-qtyatshipping(coitem_id)) >
                         (SELECT itemsite_qtyonhand FROM itemsite WHERE (itemsite_id=coitem_itemsite_id))))
 <? endif ?>
                 WHERE((coitem_cohead_id=cohead_id)
                   AND (cohead_cust_id=cust_id)
                   AND (coitem_itemsite_id=itemsite_id)
                   AND (itemsite_item_id=item_id)
                   AND (item_inv_uom_id=uom_id)
                   AND (coitem_status NOT IN ('C', 'X'))
 <? if exists("custtype_id") ?>
-                  AND (cust_custtype_id=<? value(\"custtype_id\") ?>)"
+                  AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
                   AND (cust_custtype_id IN (SELECT custtype_id
                                               FROM custtype
                                              WHERE(custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
               )
             ) AS data
 <? if exists(onlyShowShortages) ?>
       WHERE ( ((qoh + ordered - allocated) < 0)
            OR ((qoh + ordered - sobalance) < 0) )
 <? endif ?>
       ORDER BY cohead_id, cohead_number, item_number
 <? if exists(showWoSupply) ?> ,
                wo_duedate
 <? endif ?>
 ;

 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: Detail
 SELECT invcitem_linenumber,
       formatQty(invcitem_billed) AS f_billed,
       (select uom_name from uom where uom_id = invcitem_qty_uom_id) AS invuom,
       CASE WHEN (item_number IS NULL) THEN invcitem_number
            WHEN (invcitem_custpn != '') THEN invcitem_custpn
            else item_number
       END AS number,
       CASE WHEN (item_number IS NULL) THEN invcitem_descrip
            WHEN (invcitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
            ELSE item_descrip1
       END AS descrip1,
       CASE WHEN (invcitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
            ELSE item_descrip2
       END AS descrip2,
-      formatPrice(invcitem_qty_invuomratio * invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
-      formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) AS f_extprice,
+      CASE WHEN (<? value("showcosts") ?>=FALSE) THEN '---'
+           ELSE formatPrice(invcitem_qty_invuomratio * invcitem_price / COALESCE(invcitem_price_invuomratio,1))
+      END AS f_unitprice,
+      CASE WHEN (<? value("showcosts") ?>=FALSE) THEN '---'
+           ELSE formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2))
+      END AS f_extprice,
       invcitem_notes,
       getInvcitemLotSerial(invcitem_id) AS lotserial,
 --Sub-select updated for 3.1 to support kitting
       characteristicsToString('SI',invcitem_coitem_id, '=', ', ')
       AS coitem_characteristics
 FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT *,
        formatMoney(invchead_misc_amount) AS f_misc,
        formatMoney(tax)                  AS f_tax,
        formatMoney(invchead_freight)     AS f_freight,
        formatMoney(invchead_payment)     AS f_payment,
        formatMoney(noNeg(invchead_freight + invchead_misc_amount + tax +
                          itemtotal - total_allocated)) AS f_totaldue,
        formatMoney(noNeg(invchead_freight + invchead_misc_amount + tax +
                          itemtotal - total_allocated)) AS f_netdue,
        formatMoney(total_allocated) AS f_allocated
  FROM (SELECT invchead_misc_amount, invchead_freight,
               invchead_payment, invchead_notes, invchead_misc_descrip,
               (SELECT COALESCE(SUM(tax),0)
                 FROM (
                 SELECT ROUND(SUM(taxdetail_tax),2) AS tax
                 FROM tax
                  JOIN calculateTaxDetailSummary('I', <? value("invchead_id") ?>, 'T') ON (taxdetail_tax_id=tax_id)
 	   GROUP BY tax_id) AS data) AS tax,
               SUM(COALESCE(ROUND(invcitem_billed *
                                  invcitem_qty_invuomratio *
                                  invcitem_price /
                                  COALESCE(invcitem_price_invuomratio,1), 2), 0))
               AS itemtotal,
               COALESCE(
               CASE WHEN invchead_posted THEN
                  (SELECT SUM(COALESCE(currToCurr(arapply_curr_id, t.aropen_curr_id,
                                                  arapply_applied, t.aropen_docdate), 0))
                   FROM arapply, aropen s, aropen t
                   WHERE ( (s.aropen_id=arapply_source_aropen_id)
                     AND   (arapply_target_aropen_id=t.aropen_id)
                     AND   (arapply_target_doctype='I')
                     AND   (arapply_target_docnumber=invchead_invcnumber)
                     AND   (arapply_reftype='S')
                     AND   (arapply_source_aropen_id=s.aropen_id)))
               ELSE
                  (SELECT SUM(COALESCE(CASE WHEN((aropen_amount - aropen_paid) >=
-                                                currToCurr(aropenco_curr_id, aropen_curr_id,
-                                                           aropenco_amount, aropen_docdate))
-                                           THEN currToCurr(aropenco_curr_id, invchead_curr_id,
-                                                           aropenco_amount, aropen_docdate)
+                                                currToCurr(aropenalloc_curr_id, aropen_curr_id,
+                                                           aropenalloc_amount, aropen_docdate))
+                                           THEN currToCurr(aropenalloc_curr_id, invchead_curr_id,
+                                                           aropenalloc_amount, aropen_docdate)
                                            ELSE currToCurr(aropen_curr_id, invchead_curr_id,
                                                            aropen_amount - aropen_paid,
                                                            aropen_docdate)
                                       END, 0))
-                   FROM aropenco, aropen, cohead
-                  WHERE ( (aropenco_aropen_id=aropen_id)
-                    AND   (aropenco_cohead_id=cohead_id)
-                    AND   ((aropen_amount - aropen_paid) > 0)
-                    AND   (cohead_number=invchead_ordernumber)))
+                   FROM aropenalloc, aropen
+                        LEFT OUTER JOIN cohead ON (cohead_number=invchead_ordernumber)
+                  WHERE ( (aropenalloc_aropen_id=aropen_id)
+                    AND   ((aropenalloc_doctype='S' AND aropenalloc_doc_id=cohead_id) OR
+                           (aropenalloc_doctype='I' AND aropenalloc_doc_id=invchead_id))
+                    AND   ((aropen_amount - aropen_paid) > 0)))
               END, 0) AS total_allocated
        FROM invchead
             LEFT OUTER JOIN invcitem ON (invcitem_invchead_id=invchead_id)
        WHERE (invchead_id=<? value("invchead_id") ?>)
        GROUP BY invchead_freight, invchead_misc_amount, tax,
                 invchead_payment, invchead_notes, invchead_misc_descrip,
                 total_allocated
  ) AS dummy_outer
  ;
 --------------------------------------------------------------------

 QUERY: allocatedCMs
 SELECT cohead_id,
       aropen_docnumber,
       formatMoney(aropen_amount) AS f_total,
       formatMoney(aropen_paid) AS f_paid,
       formatMoney(aropen_amount - aropen_paid) AS f_balance,
-      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
+      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenalloc_curr_id,
 							     aropen_curr_id,
-							     aropenco_amount,
+							     aropenalloc_amount,
 							     aropen_docdate))
-	    THEN currToCurr(aropenco_curr_id, aropen_curr_id,
-			    aropenco_amount, aropen_docdate)
+	    THEN currToCurr(aropenalloc_curr_id, aropen_curr_id,
+			    aropenalloc_amount, aropen_docdate)
            ELSE (aropen_amount - aropen_paid)
       END AS allocated,
-      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
+      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenalloc_curr_id,
 							     aropen_curr_id,
-							     aropenco_amount,
+							     aropenalloc_amount,
 							     aropen_docdate))
-	    THEN formatMoney(currToCurr(aropenco_curr_id, aropen_curr_id,
-					aropenco_amount, aropen_docdate))
+	    THEN formatMoney(currToCurr(aropenalloc_curr_id, aropen_curr_id,
+					aropenalloc_amount, aropen_docdate))
            ELSE formatMoney(aropen_amount - aropen_paid)
       END AS f_allocated,
-      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
+      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenalloc_curr_id,
 							     aropen_curr_id,
-							     aropenco_amount,
+							     aropenalloc_amount,
 							     aropen_docdate))
-	    THEN currToCurr(aropenco_curr_id, invchead_curr_id,
-			    aropenco_amount, aropen_docdate)
+	    THEN currToCurr(aropenalloc_curr_id, invchead_curr_id,
+			    aropenalloc_amount, aropen_docdate)
            ELSE currToCurr(aropen_curr_id, invchead_curr_id,
                            aropen_amount - aropen_paid, aropen_docdate)
       END AS allocated_invccurr,
-      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
+      CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenalloc_curr_id,
 							     aropen_curr_id,
-							     aropenco_amount,
+							     aropenalloc_amount,
 							     aropen_docdate))
-	    THEN formatMoney(currToCurr(aropenco_curr_id, invchead_curr_id,
-					aropenco_amount, aropen_docdate))
+	    THEN formatMoney(currToCurr(aropenalloc_curr_id, invchead_curr_id,
+					aropenalloc_amount, aropen_docdate))
            ELSE formatMoney(currToCurr(aropen_curr_id, invchead_curr_id,
                                        aropen_amount - aropen_paid,
                                        aropen_docdate))
       END AS f_allocated_invccurr,
       curr_symbol AS aropen_currsymbol
- FROM aropenco, aropen, cohead, invchead, curr_symbol
-WHERE ( (aropenco_aropen_id=aropen_id)
-  AND   (aropenco_cohead_id=cohead_id)
-  AND   ((aropen_amount - aropen_paid) > 0)
-  AND   (aropen_curr_id=curr_id)
-  AND   (cohead_number=invchead_ordernumber)
+ FROM invchead LEFT OUTER JOIN cohead ON (cohead_number=invchead_ordernumber)
+               JOIN aropenalloc ON ((aropenalloc_doctype='S' AND aropenalloc_doc_id=cohead_id) OR
+                                    (aropenalloc_doctype='I' AND aropenalloc_doc_id=invchead_id))
+               JOIN aropen ON (aropenalloc_aropen_id=aropen_id)
+               JOIN curr_symbol ON (aropen_curr_id=curr_id)
+WHERE  ((aropen_amount - aropen_paid) > 0)
   AND   (NOT invchead_posted)
-  AND   (invchead_id=<? value("invchead_id") ?>) )
+  AND   (invchead_id=<? value("invchead_id") ?>)
 UNION
 SELECT cohead_id,
       arapply_source_docnumber AS aropen_docnumber,
       formatMoney(s.aropen_amount) AS f_total,
       formatMoney(s.aropen_paid -
                   currToCurr(arapply_curr_id, s.aropen_curr_id,
                              arapply_applied, arapply_postdate)) AS f_paid,
       formatMoney(s.aropen_amount - s.aropen_paid +
                   currToCurr(arapply_curr_id, s.aropen_curr_id,
                              arapply_applied, arapply_postdate)) AS f_balance,
       currToCurr(arapply_curr_id, s.aropen_curr_id,
                  arapply_applied, arapply_postdate) AS allocated,
       formatMoney(currToCurr(arapply_curr_id, s.aropen_curr_id,
                              arapply_applied,
                              arapply_postdate)) AS f_allocated,
       currToCurr(arapply_curr_id, invchead_curr_id,
                  arapply_applied, t.aropen_docdate) AS allocated_invccurr,
       formatMoney(currToCurr(arapply_curr_id, invchead_curr_id,
                              arapply_applied,
                              t.aropen_docdate)) AS f_allocated_invccurr,
       curr_symbol AS aropen_currsymbol
  FROM arapply, aropen s, aropen t, cohead, invchead, curr_symbol
 WHERE ( (s.aropen_id=arapply_source_aropen_id)
   AND   (arapply_target_aropen_id=t.aropen_id)
   AND   (arapply_target_doctype='I')
   AND   (arapply_target_docnumber=invchead_invcnumber)
   AND   (arapply_source_aropen_id=s.aropen_id)
   AND   (arapply_curr_id=curr_id)
   AND   (arapply_reftype='S')
   AND   (cohead_number=invchead_ordernumber)
   AND   (invchead_posted)
   AND   (invchead_id=<? value("invchead_id") ?>) )
 ORDER BY aropen_docnumber;
 --------------------------------------------------------------------

 QUERY: currency
-SELECT
-curr_symbol
-FROM
-   invchead,
-   curr_symbol
-WHERE (invchead_id = <? value("invchead_id") ?>) AND
-     invchead_curr_id = curr_id;
+SELECT currConcat(curr_id) AS currConcat, curr_symbol
+FROM invchead, curr_symbol
+WHERE (invchead_id = <? value("invchead_id") ?>)
+ AND  (invchead_curr_id = curr_id);

 --------------------------------------------------------------------
 REPORT: ItemCostDetail
 QUERY: detail
 SELECT seqnumber, item_number,
        (item_descrip1 || ' ' || item_descrip2) AS itemdescrip, uom_name,
        formatQtyper(qtyper) AS f_qtyper,
        formatScrap(bomitem_scrap) AS f_scrap,
        formatCost(cost) AS f_cost,
        formatCost(extendedcost) AS f_extendedcost,
        extendedcost
   FROM ( SELECT bomitem_seqnumber AS seqnumber,
                 itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper) AS qtyper, bomitem_scrap,
                 item_number, item_descrip1, item_descrip2, uom_name,
 <? if exists("standardCost") ?>
                 itemcost_stdcost AS cost,
-                (itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper * (1 + bomitem_scrap)) * itemcost_stdcost) AS extendedcost
+                (itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper * (1 + bomitem_scrap)) *
+                 itemcost_stdcost) AS extendedcost
 <? else ?>
-                itemcost_actcost AS cost,
-                (itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper * (1 + bomitem_scrap)) * itemcost_actcost) AS extendedcost
+                currToBase(itemcost_curr_id, itemcost_actcost, NULL) AS cost,
+                (itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper * (1 + bomitem_scrap)) *
+                 currToBase(itemcost_curr_id, itemcost_actcost, NULL)) AS extendedcost
 <? endif ?>
            FROM bomitem, item, itemcost, costelem, uom
           WHERE((bomitem_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (CURRENT_DATE BETWEEN bomitem_effective AND (bomitem_expires-1))
             AND (itemcost_item_id=item_id)
             AND (itemcost_costelem_id=costelem_id)
             AND (SELECT item_type!='C' FROM item WHERE item_id=<? value("item_id") ?>)
             AND (bomitem_parent_item_id=<? value("item_id") ?>)
             AND (costelem_id=<? value("costelem_id") ?>) ) ) AS data

 UNION

 SELECT seqnumber, item_number,
        (item_descrip1 || ' ' || item_descrip2) AS itemdescrip, uom_name,
        formatQtyPer(bbomitem_qtyper) AS f_qtyper,
        formatScrap(bbomitem_costabsorb) AS f_scrap,
        formatCost(cost) AS f_cost,
        formatCost(extendedcost) AS f_extendedcost,
        extendedcost
   FROM ( SELECT bbomitem_seqnumber AS seqnumber, bbomitem_qtyper, bbomitem_costabsorb,
                 item_number, item_descrip1, item_descrip2, uom_name,
 <? if exists("standardCost") ?>
                 itemcost_stdcost AS cost,
                 (itemcost_stdcost / bbomitem_qtyper * bbomitem_costabsorb) AS extendedcost
 <? else ?>
-                itemcost_actcost AS cost,
-                (itemcost_actcost / bbomitem_qtyper * bbomitem_costabsorb) AS extendedcost
+                currToBase(itemcost_curr_id, itemcost_actcost, NULL) AS cost,
+                (currToBase(itemcost_curr_id, itemcost_actcost, NULL) / bbomitem_qtyper * bbomitem_costabsorb) AS extendedcost
 <? endif ?>
            FROM bbomitem, item, itemcost, uom
           WHERE((bbomitem_parent_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (CURRENT_DATE BETWEEN bbomitem_effective AND (bbomitem_expires-1))
             AND (itemcost_item_id=bbomitem_parent_item_id)
             AND (itemcost_costelem_id=<? value("costelem_id") ?>)
             AND (SELECT item_type='C' FROM item WHERE item_id=<? value("item_id") ?>)
             AND (bbomitem_item_id=<? value("item_id") ?>) )

           UNION

          SELECT source.bbomitem_seqnumber AS seqnumber,
                 source.bbomitem_qtyper, target.bbomitem_costabsorb,
                 item_number, item_descrip1, item_descrip2, uom_name,
 <? if exists("standardCost") ?>
                 itemcost_stdcost AS cost,
                 (itemcost_stdcost * source.bbomitem_qtyper / target.bbomitem_qtyper * target.bbomitem_costabsorb) AS extendedcost
 <? else ?>
-                itemcost_actcost AS cost,
-                (itemcost_actcost * source.bbomitem_qtyper / target.bbomitem_qtyper * target.bbomitem_costabsorb) AS extendedcost
+                currToBase(itemcost_curr_id, itemcost_actcost, NULL) AS cost,
+                (currToBase(itemcost_curr_id, itemcost_actcost, NULL) * source.bbomitem_qtyper / target.bbomitem_qtyper * target.bbomitem_costabsorb) AS extendedcost
 <? endif ?>
            FROM item, itemcost, bbomitem AS target, bbomitem AS source, uom
           WHERE ( (source.bbomitem_parent_item_id=target.bbomitem_parent_item_id)
             AND (CURRENT_DATE BETWEEN source.bbomitem_effective AND (source.bbomitem_expires-1))
             AND (CURRENT_DATE BETWEEN target.bbomitem_effective AND (target.bbomitem_expires-1))
             AND (source.bbomitem_item_id=itemcost_item_id)
             AND (source.bbomitem_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (item_type='Y')
             AND (SELECT item_type='C' FROM item WHERE item_id=<? value("item_id") ?>)
             AND (target.bbomitem_item_id=<? value("item_id") ?>)
             AND (itemcost_costelem_id=<? value("costelem_id") ?>) ) ) AS data
  ORDER BY seqnumber;

 --------------------------------------------------------------------
 REPORT: ItemCostSummary
 QUERY: detail
 SELECT itemcost_id,
        CASE WHEN (costelem_sys) THEN 1
             ELSE 0
        END,
        costelem_type as f_element,
        formatBoolYN(itemcost_lowlevel) as f_lower,
        formatCost(itemcost_stdcost) as f_stdcost,
        formatDate(itemcost_posted, 'Never') as f_posted,
-       formatcost(itemcost_actcost) as f_actcost,
+       formatcost(currToBase(itemcost_curr_id, itemcost_actcost, NULL)) as f_actcost,
        formatDate(itemcost_updated, 'Never') as f_updated,
-       itemcost_stdcost AS stdcost, itemcost_actcost AS actcost
+       itemcost_stdcost AS stdcost, currToBase(itemcost_curr_id, itemcost_actcost, NULL) AS actcost
   FROM itemcost, costelem
  WHERE ((itemcost_costelem_id=costelem_id)
    AND (itemcost_item_id=<? value("item_id") ?>)
 )
 ORDER BY itemcost_lowlevel, costelem_type;

 --------------------------------------------------------------------
 REPORT: MetaSQLMasterList
 QUERY: Detail
-SELECT metasql.*,
-       CASE WHEN nspname = 'public' THEN ''
-            ELSE nspname
-       END AS schema
-  FROM metasql
-  JOIN pg_class ON (metasql.tableoid=pg_class.oid)
-  JOIN pg_namespace ON (relnamespace=pg_namespace.oid)
-ORDER BY schema, metasql_group, metasql_name;
+== MetaSQL statement metasqls-detail

 --------------------------------------------------------------------
 REPORT: POsByDate
 QUERY: detail
-SELECT warehous_code AS warehousecode,
-       pohead_number as f_ponumber,
-       vend_name,
-       CASE WHEN(poitem_status='C') THEN TEXT('Closed')
-            WHEN(poitem_status='U') THEN TEXT('Unposted')
-            WHEN(poitem_status='O' AND (SUM(poitem_qty_received-poitem_qty_returned) > 0) AND (SUM(poitem_qty_ordered)>SUM(poitem_qty_received-poitem_qty_returned))) THEN TEXT('Partial')
-            WHEN(poitem_status='O' AND (SUM(poitem_qty_received-poitem_qty_returned) > 0) AND (SUM(poitem_qty_ordered)=SUM(poitem_qty_received-poitem_qty_returned))) THEN TEXT('Recieved')
-            WHEN(poitem_status='O') THEN TEXT('Open')
-            ELSE poitem_status
-       END AS poitemstatus,
-       formatDate(MIN(poitem_duedate)) as f_duedate,
-       MIN(poitem_duedate) AS min_duedate
-  FROM poitem, vend, pohead
-       LEFT OUTER JOIN
-         warehous
-         ON (pohead_warehous_id=warehous_id)
- WHERE ((poitem_pohead_id=pohead_id)
-   AND (pohead_vend_id=vend_id)
-   AND (poitem_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-   AND ( pohead_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
-   AND (pohead_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-<? if not exists("showClosed") ?>
-   AND (poitem_status!='C')
-<? endif ?>
-)
-GROUP BY warehous_code, pohead_number, vend_name,
-         poitem_status
-ORDER BY min_duedate;
+== MetaSQL statement purchaseOrders-detail

 --------------------------------------------------------------------
 REPORT: PickingListSONoClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS item_invuom,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
             ELSE NULL
        END AS shipped,
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
             ELSE NULL
        END AS balance,
        CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
             ELSE NULL
        END AS atShipping,
        formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
                             FROM coship, cosmisc
                             WHERE ( (coship_coitem_id=coitem_id)
                               AND (coship_cosmisc_id=cosmisc_id)
                               AND (NOT cosmisc_shipped) ) )/ CASE WHEN(itemuomratiobytype(item_id, 'Selling') = 0) THEN 1 ELSE itemuomratiobytype(item_id, 'Selling') END ) ) AS shipatshipping,
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
             WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
                                          + qtyOrdered(itemsite_id, CURRENT_DATE))
                                           >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
             ELSE coitem_status
        END AS f_status
   FROM itemsite, item, uom, coitem
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_status <> 'C')
    AND (item_type != 'K')
 -- 1 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
    <? if exists("hide closed") ?>
    AND (coitem_status <> 'C')
 -- 2 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
--- <? endif ?>
+   <? endif ?>
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_subnumber, coitem_id, coitem_memo, item_number, item_invuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 ORDER BY linenumber;

 --------------------------------------------------------------------
 REPORT: PricingScheduleAssignments
 QUERY: detail
 SELECT ipsass_id,
-       CASE WHEN (ipsass_shipto_id=-1) THEN TEXT('ANY')
-            ELSE (SELECT shipto_num FROM shipto WHERE (shipto_id=ipsass_shipto_id))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT shipto_num FROM shipto WHERE (shipto_id=ipsass_shipto_id))
+            WHEN (COALESCE(LENGTH(ipsass_shipto_pattern), 0) > 0) THEN ipsass_shipto_pattern
+            ELSE TEXT('ANY')
        END AS shiptonum,
-       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_number
-                                                FROM cust, shipto
-                                                WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_number FROM shipto, cust WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
             WHEN (ipsass_cust_id=-1) THEN TEXT('Any')
             ELSE (SELECT cust_number FROM cust WHERE (cust_id=ipsass_cust_id))
        END AS custnumber,
-       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_name
-                                                FROM cust, shipto
-                                                WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_name FROM shipto, cust WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
             WHEN (ipsass_cust_id=-1) THEN ''
             ELSE (SELECT cust_name FROM cust WHERE (cust_id=ipsass_cust_id))
        END AS custname,
        CASE WHEN (ipsass_cust_id != -1) THEN TEXT('N/A')
             WHEN (ipsass_shipto_id != -1) THEN TEXT('N/A')
+            WHEN (COALESCE(LENGTH(ipsass_shipto_pattern),0) > 0) THEN TEXT('N/A')
             WHEN (ipsass_custtype_id=-1) THEN ipsass_custtype_pattern
             ELSE (SELECT custtype_code FROM custtype WHERE (custtype_id=ipsass_custtype_id))
        END AS custtype,
        ipshead_name
-  FROM ipsass, ipshead
- WHERE (ipshead_id=ipsass_ipshead_id)
+FROM ipsass, ipshead
+WHERE (ipshead_id=ipsass_ipshead_id)
 ORDER BY custname, custtype;
+

 --------------------------------------------------------------------
 REPORT: PurchaseOrder
 QUERY: Detail
 SELECT poitem_linenumber,
        poitem_comments,
        poitem_linenumber AS f_line,
        item_number,
        poitem_vend_item_number,
        CASE WHEN (LENGTH(TRIM(BOTH '	' FROM poitem_vend_item_descrip)) <= 0) THEN
           (item_descrip1 || '' || item_descrip2)
        ELSE (poitem_vend_item_descrip)
        END AS itemdescription,
        formatQty(poitem_qty_ordered) AS f_ordered,
        CASE WHEN (poitem_vend_uom LIKE '') THEN (uom_name)
             ELSE (poitem_vend_uom)
        END AS itemuom,
-       formatPrice(poitem_unitprice) AS f_price,
+       formatPurchPrice(poitem_unitprice) AS f_price,
        formatExtPrice(poitem_unitprice * poitem_qty_ordered) AS f_extended,
        formatDate(poitem_duedate) AS f_duedate,
        characteristicsToString('PI', poitem_id, '=', ', ') AS poitem_characteristics
 FROM poitem
 	LEFT OUTER JOIN itemsite ON (poitem_itemsite_id = itemsite_id)
 	LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (itemsite_item_id = item_id)
 WHERE 	(poitem_pohead_id=<? value("pohead_id") ?>)
 ORDER BY poitem_linenumber;

 --------------------------------------------------------------------
 REPORT: QOH
 QUERY: detail
-SELECT itemsite_id,
-       detail,
-       item_number,
-       item_descrip1,
-       item_descrip2,
-       uom_name,
-       warehous_code,
-       formatQty(reorderlevel) AS f_reorderlevel,
-       formatQty(qoh) AS f_qoh,
-       CASE WHEN (NOT useDefaultLocation(itemsite_id)) THEN 'None'
-                 ELSE defaultLocationName(itemsite_id)
-       END AS defaultlocation,
-       formatQty(nonnetable) AS f_nonnetable,
-       <? if exists("showValue") ?>
-         formatCost(standardcost)
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_unitcost,
+== MetaSQL statement qoh-detail
+--------------------------------------------------------------------
+
+QUERY: total
+SELECT SUM(qoh) AS f_qoh,
+       SUM(nonnetable) AS f_nonnetable,
        <? if exists("showValue") ?>
-         formatExtPrice((standardcost * qoh))
+         FormatExtPrice(SUM(standardcost * qoh))
        <? else ?>
-         text('')
+         ''
        <? endif ?>
        AS f_value,
        <? if exists("showValue") ?>
-         CASE WHEN (itemsite_loccntrl) THEN formatExtPrice((standardcost * nonnetable))
-              ELSE 'N/A'
-         END
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_nonnetvalue,
-       standardcost,
-       qoh,
-       nonnetable,
-       qoh AS r_qoh,
-       nonnetable AS r_nonnetable,
-       <? if exists("showValue") ?>
-         (standardcost * qoh)
-       <? else ?>
-         0
-       <? endif ?>
-       AS r_value,
-       <? if exists("showValue") ?>
-         CASE WHEN (itemsite_loccntrl) THEN (standardcost * nonnetable)
+         FormatExtPrice(SUM(CASE WHEN (itemsite_loccntrl) THEN (standardcost * nonnetable)
               ELSE 0
-         END
-       <? else ?>
-         0
-       <? endif ?>
-       AS r_nonnetvalue,
-       <? if exists("showValue") ?>
-         <? if exists("usePostedCosts") ?>
-           CASE WHEN(itemsite_costmethod='A') THEN text('Average')
-                WHEN(itemsite_costmethod='S') THEN text('Standard')
-                WHEN(itemsite_costmethod='J') THEN text('Job')
-                WHEN(itemsite_costmethod='N') THEN text('None')
-                ELSE text('UNKNOWN')
-           END
-         <? else ?>
-           text('')
-         <? endif ?>
+                            END))
        <? else ?>
-         text('')
+         ''
        <? endif ?>
-       AS f_costmethod
+       AS f_nonnetvalue
 FROM ( SELECT itemsite_id, itemsite_costmethod,
               item_number,
               item_descrip1, item_descrip2, itemsite_loccntrl,
               warehous_code,
               uom_name,
               CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
               itemsite_qtyonhand AS qoh,
               CASE WHEN ((itemsite_loccntrl) OR (itemsite_controlmethod IN ('L', 'S'))) THEN 1
                    ELSE 0
               END AS detail,
               itemsite_nnqoh AS nonnetable,
               <? if exists("useActualCosts") ?>
                 actcost(itemsite_item_id)
               <? elseif exists("useStandardCosts") ?>
                 stdcost(itemsite_item_id)
               <? else ?>
                 (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
               <? endif ?>
               AS standardcost
          FROM itemsite, item, uom, warehous, costcat
         WHERE ((itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (itemsite_costcat_id=costcat_id)
           AND (itemsite_active)
+<? if exists("item_id") ?>
+          AND (item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("classcode_id") ?>
           AND (item_classcode_id=<? value("classcode_id") ?>)
 <? endif ?>
 <? if exists("classcode_pattern") ?>
           AND (item_classcode_id IN (SELECT classcode_id
                                        FROM classcode
                                       WHERE (classcode_code ~ <? value("classcode_pattern") ?>) ) )
 <? endif ?>
 <? if exists("costcat_id") ?>
           AND (costcat_id=<? value("costcat_id") ?>)
 <? endif ?>
 <? if exists("costcat_pattern") ?>
           AND (costcat_id IN (SELECT costcat_id
                                        FROM costcat
                                       WHERE (costcat_code ~ <? value("costcat_pattern") ?>) ) )
 <? endif ?>
 <? if exists("itemgrp_id") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? endif ?>
 <? if exists("itemgrp_pattern") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem, itemgrp
                             WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                               AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? endif ?>
 <? if exists("onlyShowPositive") ?>
           AND (itemsite_qtyonhand > 0)
 <? elseif exists("onlyShowNegative") ?>
           AND (itemsite_qtyonhand < 0)
 <? endif ?>
 <? if exists("warehous_id") ?>
           AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 ) ) AS data
-ORDER BY warehous_code, item_number;
+;

 --------------------------------------------------------------------
 REPORT: ReportsMasterList
 QUERY: detail
-select report_name, report_descrip
-  from report
-order by report_name;
+== MetaSQL statement reports-detail

 --------------------------------------------------------------------
 REPORT: RunningAvailability
 QUERY: detail
-<? if exists("MultiWhs") ?>
-SELECT tohead_id AS orderid, toitem_id AS altorderid, 'T/O' AS ordertype,
-       TEXT(tohead_number) AS ordernumber,
-       1 AS sequence,
-       tohead_srcname || '/' || tohead_destname AS item_number,
-       formatDate(toitem_duedate) AS duedate,
-       toitem_duedate AS r_duedate,
-       (toitem_duedate < CURRENT_DATE) AS late,
-       formatQty(toitem_qty_ordered) AS f_qtyordered,
-       formatQty(toitem_qty_received) AS f_qtyreceived,
-       formatQty(noNeg(toitem_qty_ordered - toitem_qty_received)) AS f_balance,
-       noNeg(toitem_qty_ordered - toitem_qty_received) AS balance
-FROM tohead, toitem
-WHERE ((toitem_tohead_id=tohead_id)
-  AND  (toitem_status = 'O')
-  AND  (toitem_item_id=<? value("item_id") ?>)
-  AND  (tohead_dest_warehous_id=<? value("warehous_id") ?>)
-  AND  (toitem_qty_ordered > toitem_qty_received) )
-
-UNION
-SELECT tohead_id AS orderid, toitem_id AS altorderid, 'T/O' AS ordertype,
-       TEXT(tohead_number) AS ordernumber,
-       1 AS sequence,
-       tohead_srcname || '/' || tohead_destname AS item_number,
-       formatDate(toitem_duedate) AS duedate,
-       toitem_duedate AS r_duedate,
-       (toitem_duedate < CURRENT_DATE) AS late,
-       formatQty(toitem_qty_ordered) AS f_qtyordered,
-       formatQty(toitem_qty_received) AS f_qtyreceived,
-       formatQty(-1 * noNeg(toitem_qty_ordered - toitem_qty_shipped - qtyAtShipping('TO', toitem_id))) AS f_balance,
-       -1 * noNeg(toitem_qty_ordered - toitem_qty_received) AS balance
-FROM tohead, toitem
-WHERE ((toitem_tohead_id=tohead_id)
-  AND  (toitem_status = 'O')
-  AND  (toitem_item_id=<? value("item_id") ?>)
-  AND  (tohead_src_warehous_id=<? value("warehous_id") ?>)
-  AND  (toitem_qty_ordered - toitem_qty_shipped - qtyAtShipping('TO', toitem_id)) > 0 )
-
-UNION
-<? endif ?>
-SELECT wo_id AS orderid, -1 AS altorderid,
-       'W/O' AS ordertype,
-       formatWoNumber(wo_id) AS ordernumber,
-       1 AS sequence,
-       item_number,
-       formatDate(wo_duedate) AS duedate,
-       wo_duedate AS r_duedate,
-       (wo_duedate < CURRENT_DATE) AS late,
-       formatQty(wo_qtyord) AS f_qtyordered,
-       formatQty(wo_qtyrcv) AS f_qtyreceived,
-       formatQty(noNeg(wo_qtyord - wo_qtyrcv)) AS f_balance,
-       noNeg(wo_qtyord - wo_qtyrcv) AS balance
-FROM wo, itemsite, item
-WHERE ((wo_status<>'C')
-  AND  (wo_itemsite_id=itemsite_id)
-  AND  (itemsite_item_id=item_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=<? value("item_id") ?>)
-  AND  (item_type NOT IN ('C', 'Y')))
-
-<? if exists("Manufacturing") ?>
-UNION
-SELECT wo_id AS orderid, -1 AS altorderid,
-       'W/O' AS ordertype,
-       formatWoNumber(wo_id) AS ordernumber,
-       1 AS sequence,
-       item_number,
-       formatDate(wo_duedate) AS duedate,
-       wo_duedate AS r_duedate,
-       (wo_duedate < CURRENT_DATE) AS late,
-       formatQty(wo_qtyord * brddist_stdqtyper) AS f_qtyordered,
-       formatQty(wo_qtyrcv * brddist_stdqtyper) AS f_qtyreceived,
-       formatQty(noNeg((wo_qtyord - wo_qtyrcv) * brddist_stdqtyper)) AS f_balance,
-       noNeg((wo_qtyord - wo_qtyrcv) * brddist_stdqtyper) AS balance
-FROM xtmfg.brddist, wo, itemsite, item
-WHERE ((wo_status<>'C')
-  AND  (brddist_wo_id=wo_id)
-  AND  (wo_itemsite_id=itemsite_id)
-  AND  (itemsite_item_id=item_id)
-  AND  (brddist_itemsite_id=itemsite_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=<? value("item_id") ?>)
-  AND  (item_type IN ('C', 'Y')) )
-<? endif ?>
-
-UNION
-SELECT wo_id AS orderid, womatl_id AS altorderid,
-      'W/O' AS ordertype,
-      formatWoNumber(wo_id) AS ordernumber,
-      2 AS sequence,
-      item_number,
-      formatDate(womatl_duedate) AS duedate,
-      womatl_duedate AS r_duedate,
-      FALSE AS late,
-      formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyreq)) AS f_qtyordered,
-      formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyiss)) AS f_qtyreceived,
-      formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1))) AS f_balance,
-      itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1)) AS balance
-FROM womatl, wo, itemsite AS wois, item, itemsite AS womatlis
-WHERE ((wo_status<>'C')
-  AND  (wo_itemsite_id=wois.itemsite_id)
-  AND  (wois.itemsite_item_id=item_id)
-  AND  (womatl_wo_id=wo_id)
-  AND  (womatlis.itemsite_item_id=<? value("item_id") ?>)
-  AND  (womatlis.itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (womatl_itemsite_id=womatlis.itemsite_id) )
-
-UNION
-SELECT pohead_id AS orderid, poitem_id AS altorderid,
-      'P/O' AS ordertype,
-      TEXT(pohead_number) AS ordernumber,
-      1 AS sequence,
-      '' AS item_number,
-      formatDate(poitem_duedate) AS duedate,
-      poitem_duedate AS r_duedate,
-      (poitem_duedate < CURRENT_DATE) AS late,
-      formatQty(poitem_qty_ordered * poitem_invvenduomratio) AS f_qtyordered,
-      formatQty(poitem_qty_received * poitem_invvenduomratio) AS f_qtyreceived,
-      formatQty(noNeg(poitem_qty_ordered - poitem_qty_received) * poitem_invvenduomratio) AS f_balance,
-      (noNeg(poitem_qty_ordered - poitem_qty_received) * poitem_invvenduomratio) AS balance
-FROM pohead, poitem, itemsite, item
-WHERE ((poitem_pohead_id=pohead_id)
-  AND  (poitem_status <> 'C')
-  AND  (poitem_itemsite_id=itemsite_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=item_id)
-  AND  (item_id=<? value("item_id") ?>)
-  AND  (item_type IN ('P', 'M', 'C', 'O')) )
-
-UNION
-SELECT cohead_id AS orderid, coitem_id AS altorderid,
-       'S/O' AS ordertype,
-       TEXT(cohead_number) AS ordernumber,
-       2 AS sequence,
-       cust_name AS item_number,
-       formatDate(coitem_scheddate) AS duedate,
-       coitem_scheddate AS r_duedate,
-       (coitem_scheddate < CURRENT_DATE) AS late,
-       formatQty(coitem_qty_invuomratio * coitem_qtyord) AS f_qtyordered,
-       formatQty(coitem_qty_invuomratio * (coitem_qtyshipped - coitem_qtyreturned + qtyAtShipping(coitem_id))) AS f_qtyreceived,
-       formatQty(coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS f_balance,
-       (coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS balance
-FROM coitem, cohead, cust, itemsite, item
-WHERE ((coitem_status='O')
-  AND  (cohead_cust_id=cust_id)
-  AND  (coitem_cohead_id=cohead_id)
-  AND  (coitem_itemsite_id=itemsite_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=item_id)
-  AND  (item_id=<? value("item_id") ?>)
-  AND  item_sold )
-
-<? if exists("showPlanned") ?>
-<? if exists("showMRPplan") ?>
-UNION
-SELECT planord_id AS orderid, -1 AS altorderid,
-       'Planned P/O' AS ordertype,
---       CASE WHEN (planord_firm) THEN <? value("firmPo") ?>
--- 	   ELSE <? value("plannedPo") ?>
---       END AS ordernumber,
---2.3 replaced case above with actual order number for higher level demand
-       CAST(planord_number AS text) AS ordernumber,
-       1 AS sequence,
-       '' AS item_number,
-       formatDate(planord_duedate) AS duedate,
-       planord_duedate AS r_duedate,
-       FALSE AS late,
-       formatQty(planord_qty) AS f_qtyordered,
-       '' AS f_qtyreceived,
-       formatQty(planord_qty) AS f_balance,
-       planord_qty AS balance
-FROM planord, itemsite
-WHERE ((planord_type='P')
-  AND  (planord_itemsite_id=itemsite_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=<? value("item_id") ?>) )
-
-UNION
-SELECT planord_id AS orderid, -1 AS altorderid,
-       'Planned W/O' AS ordertype,
---       CASE WHEN (planord_firm) THEN <? value("firmWo") ?>
---	    ELSE <? value("plannedWo") ?>
---       END AS ordernumber,
---2.3 replaced case above with actual order number
-       CAST(planord_number AS text) AS ordernumber,
-       1 AS sequence,
-       '' AS item_number,
-       formatDate(planord_duedate) AS duedate,
-       planord_duedate AS r_duedate,
-       FALSE AS late,
-       formatQty(planord_qty) AS f_qtyordered,
-       '' AS f_qtyreceived,
-       formatQty(planord_qty) AS f_balance,
-       planord_qty AS balance
-FROM planord, itemsite
-WHERE ((planord_type='W')
-  AND  (planord_itemsite_id=itemsite_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=<? value("item_id") ?>) )
-
-UNION
-SELECT planreq_id AS orderid, -1 AS altorderid,
-       'Planned W/O' AS ordertype,
---       CASE WHEN (planord_firm) THEN <? value("firmWoReq") ?>
---	    ELSE <? value("plannedWoReq") ?>
---       END AS ordernumber,
---2.3 replaced case above with actual order number for higher level demand
-       CAST(planord_number AS text) AS ordernumber,
-       1 AS sequence,
---2.3 Start
---Starting here a sub-select gets the planned order number for the higher level demand
-             (SELECT item_number
-                FROM item, itemsite
-               WHERE((itemsite_item_id=item_id)
-                 AND (itemsite_id=planord_itemsite_id))
-             ) AS item_number,
---End of subselect to get higher level item number
---2.3 Start
-       formatDate(planord_startdate) AS duedate,
-       planord_startdate AS r_duedate,
-       FALSE AS late,
-       formatQty(planreq_qty) AS f_qtyordered,
-       '' AS f_qtyreceived,
-       formatQty(planreq_qty * -1) AS f_balance,
-       (planreq_qty * -1) AS balance
-FROM planreq, planord, itemsite, item
-WHERE ((planreq_source='P')
-  AND  (planreq_source_id=planord_id)
-  AND  (planreq_itemsite_id=itemsite_id)
-  AND  (itemsite_item_id=item_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=<? value("item_id") ?>) )
-<? endif ?>
-
-UNION
-SELECT pr_id AS orderid, -1 AS altorderid,
-       'P/R' AS ordertype,
---       <? value("pr") ?> AS ordernumber,
---2.3 replaced above with actual order number
-       CAST(pr_number AS text) AS ordernumber,
-       1 AS sequence,
-       '' AS item_number,
-       formatDate(pr_duedate) AS duedate,
-       pr_duedate AS r_duedate,
-       FALSE AS late,
-       formatQty(pr_qtyreq) AS f_qtyordered,
-       '' AS f_qtyreceived,
-       formatQty(pr_qtyreq) AS f_balance,
-       pr_qtyreq AS balance
-FROM pr, itemsite, item
-WHERE ((pr_itemsite_id=itemsite_id)
-  AND  (itemsite_item_id=item_id)
-  AND  (pr_itemsite_id=itemsite_id)
-  AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (itemsite_item_id=<? value("item_id") ?>) )
-<? endif ?>
-
-UNION
-
-SELECT -1 AS orderid, -1 AS altorderid,
-             '' AS ordertype,
-             '' AS ordernumber,
-             -1 AS sequence,
-             'Initial QOH' AS item_number,
-             '' AS duedate,
-             date('1/1/1978') AS r_duedate,
-             FALSE AS late,
-             '' AS f_qtyordered,
-             '' AS f_qtyreceived,
-             '' AS f_balance,
-             itemsite_qtyonhand AS balance
-        FROM itemsite
-       WHERE ((itemsite_item_id=<? value("item_id") ?>)
-         AND (itemsite_warehous_id=<? value("warehous_id") ?>))
-
-ORDER BY r_duedate, sequence;
-
-
+== MetaSQL statement runningAvailability-detail

 --------------------------------------------------------------------
 REPORT: Statement
 QUERY: detail
 SELECT CASE WHEN (araging_doctype = 'I') THEN <? value("invoice") ?>
-            WHEN (araging_doctype = 'D') THEN <? value("debit") ?>
-            WHEN (araging_doctype = 'C') THEN <? value("credit") ?>
+            WHEN (araging_doctype = 'D') THEN <? value("debitMemo") ?>
+            WHEN (araging_doctype = 'C') THEN <? value("creditMemo") ?>
             WHEN (araging_doctype = 'R') THEN <? value("deposit") ?>
             ELSE 'Misc.'
        END AS doctype,
        araging_docnumber AS f_docnumber,
        formatDate(CAST(araging_docdate AS DATE)) AS f_docdate,
-       CASE WHEN (araging_doctype IN ('I','D')) THEN formatDate(araging_duedate)
+       CASE WHEN (araging_doctype IN ('I','C','D')) THEN formatDate(araging_duedate)
             ELSE ''
        END AS f_duedate,
        formatMoney(araging_aropen_amount) AS f_amount,
        formatMoney(araging_aropen_amount - araging_total_val) AS f_applied,
        formatMoney(araging_total_val) AS f_balance
 FROM araging(<? value("asofdate") ?>, true, false)
 WHERE ((araging_cust_id = <? value("cust_id") ?>)
    AND (abs(araging_aropen_amount) > 0)
       )
 ORDER BY araging_duedate;

 --------------------------------------------------------------------
 REPORT: SummarizedBankrecHistory
 QUERY: detail
 SELECT bankrec_id,
        formatBoolYN(bankrec_posted) AS f_posted,
        formatDate(bankrec_created) AS f_created,
        formatDate(bankrec_postdate) AS f_postdate,
        bankrec_username AS f_username,
        formatDate(bankrec_opendate) AS f_opendate,
        formatDate(bankrec_enddate) AS f_enddate,
        formatMoney(bankrec_openbal) AS f_openbal,
        formatMoney(bankrec_endbal) AS f_endbal
   FROM bankrec
- WHERE (bankrec_bankaccnt_id=<? value("bankaccnt_id") ?>)
+ WHERE (bankrec_bankaccnt_id=<? value("bankaccntid") ?>)
  ORDER BY bankrec_created;
 --------------------------------------------------------------------

 QUERY: head
 SELECT (bankaccnt_name || '-' || bankaccnt_descrip) AS f_bankaccnt
   FROM bankaccnt
- WHERE (bankaccnt_id=<? value("bankaccnt_id") ?>);
+ WHERE (bankaccnt_id=<? value("bankaccntid") ?>);

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistory
 QUERY: detail
 SELECT 1 AS dummy,
 <? foreach("groupLitList") ?>
   <? literal("groupLitList") ?>
   <? if not isLast("groupLitList") ?>
   || E'\n' ||
   <? endif ?>
 <? endforeach ?> AS groupsLit,
 <? foreach("groupList") ?>
   substring(<? literal("groupList") ?> from 1 for 15)
   <? if not isLast("groupList") ?>
   || E'\n' ||
   <? endif ?>
 <? endforeach ?> AS groups,
 <? foreach("groupDescripList") ?>
   substring(<? literal("groupDescripList") ?> from 1 for 30)
   <? if not isLast("groupDescripList") ?>
   || E'\n' ||
   <? endif ?>
 <? endforeach ?> AS groupsDescrip,
        formatDate(MIN(cohist_invcdate)) AS firstsale,
        formatDate(MAX(cohist_invcdate)) AS lastsale,
        formatQty(SUM(cohist_qtyshipped)) AS qty,
 <? if exists("byCurrency") ?>
        currAbbr,
        formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS sales
 <? else ?>
        currConcat(baseCurrId()) AS currAbbr,
        formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS sales
 <? endif ?>
 FROM saleshistory
 WHERE (true
 <? if exists("startDate") ?>
  AND (cohist_invcdate >= <? value("startDate") ?>)
 <? endif ?>

 <? if exists("endDate") ?>
  AND (cohist_invcdate <= <? value("endDate") ?>)
 <? endif ?>

 <? if exists("shipStartDate") ?>
  AND (cohist_shipdate >= <? value("shipStartDate") ?>)
 <? endif ?>

 <? if exists("shipEndDate") ?>
  AND (cohist_shipdate <= <? value("shipEndDate") ?>)
 <? endif ?>

 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>

+<? if exists("item_id") ?>
+ AND (itemsite_item_id=<? value("item_id") ?>)
+<? endif ?>
+
 <? if exists("cust_id") ?>
  AND (cohist_cust_id=<? value("cust_id") ?>)
 <? endif ?>

+<? if exists("shipto_id") ?>
+ AND (cohist_shipto_id=<? value("shipto_id") ?>)
+<? endif ?>
+
+<? if exists("salesrep_id") ?>
+ AND (cohist_salesrep_id=<? value("salesrep_id") ?>)
+<? endif ?>
+
 <? if exists("prodcat_id") ?>
  AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>

 <? if exists("prodcat_pattern") ?>
- AND (item_prodcat_id IN (SELECT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
+ AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>

 <? if exists("custtype_id") ?>
  AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>

 <? if exists("custtype_pattern") ?>
-   AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
+   AND (custtype_code ~ <? value("custtype_pattern") ?>)
+<? endif ?>
+
+<? if exists("custgrp_id") ?>
+  AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
+                   FROM custgrpitem
+                   WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
+<? endif ?>
+
+<? if exists("custgrp_pattern") ?>
+  AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
+                   FROM custgrp, custgrpitem
+                   WHERE ( (custgrpitem_custgrp_id=custgrp_id)
+                     AND   (custgrp_name ~ <? value("custgrp_pattern") ?>) )) )
 <? endif ?>

 <? if exists("shipzone_id") ?>
  AND (shipzone_id=<? value("shipzone_id") ?>)
 <? endif ?>

 <? if exists("curr_id") ?>
  AND cust_curr_id = <? value("curr_id") ?>
 <? endif ?>

 <? if exists("currConcat_pattern") ?>
- AND cust_curr_id IN (SELECT curr_id FROM curr_symbol WHERE currConcat(curr_id) ~ <? value("currConcat_pattern") ?>)
+ AND (currAbbr ~ <? value("currConcat_pattern") ?>)
 <? endif ?>
 )
 GROUP BY dummy
 <? if exists("bySalesRep") ?>
  , cohist_salesrep_id, salesrep_number, salesrep_name
 <? endif ?>
 <? if exists("byShippingZone") ?>
  , shipzone_id, shipzone_name, shipzone_descrip
 <? endif ?>
 <? if exists("byCustomer") ?>
  , cohist_cust_id, cust_number, cust_name
 <? endif ?>
 <? if exists("byCustomerType") ?>
  , cust_custtype_id, custtype_code, custtype_descrip
 <? endif ?>
 <? if exists("byItem") ?>
  , item_id, item_number, itemdescription
 <? endif ?>
 <? if exists("bySite") ?>
  , itemsite_warehous_id, warehous_code, warehous_descrip
 <? endif ?>
 <? if exists("byCurrency") ?>
  , cust_curr_id, currAbbr
 <? endif ?>
  ORDER BY dummy
 <? if exists("bySalesRep") ?>
  , salesrep_number
 <? endif ?>
 <? if exists("byShippingZone") ?>
  , shipzone_name
 <? endif ?>
 <? if exists("byCustomer") ?>
  , cust_number
 <? endif ?>
 <? if exists("byCustomerType") ?>
  , custtype_code
 <? endif ?>
 <? if exists("byItem") ?>
  , item_number
 <? endif ?>
 <? if exists("bySite") ?>
  , warehous_code
 <? endif ?>
 ;

 --------------------------------------------------------------------
 REPORT: TimePhasedBookings
 QUERY: detail
 SELECT *,
   coalesce(unit,0) AS unit,
 <? if exists("salesDollars") ?>
   formatExtPrice(coalesce(unit,0)) AS f_unit
 <? else ?>
   formatQty(coalesce(unit,0)) AS f_unit
 <? endif ?>
 FROM
 -- Outer Table Query
 (SELECT DISTINCT
        calitem_id,
        findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
 <? if exists("byCust") ?>
          cust_id, cust_number AS f_number, cust_name AS f_description
 <? elseif exists("byProdcat") ?>
          prodcat_id, prodcat_code AS f_number, prodcat_descrip AS f_description
 <? elseif exists("byItem") ?>
          item_id, item_number AS f_number, item_descrip1 AS f_description
 <? endif ?>
        , warehous_id, warehous_code
 <? if exists("salesDollars") ?>
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
 FROM coitem
  JOIN cohead ON (coitem_cohead_id=cohead_id)
  JOIN itemsite ON (coitem_itemsite_id=itemsite_id)
  JOIN item ON (itemsite_item_id=item_id)
 <? if exists("inventoryUnits") ?>
  JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
  JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
  JOIN custinfo ON (cohead_cust_id=cust_id)
 <? endif ?>
 <? if reExists("[pP]rodcat") ?>
  JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
     ,   ( SELECT rcalitem_id AS calitem_id,
                 findPeriodStart(rcalitem_id) AS calitem_start,
                 findPeriodEnd(rcalitem_id) AS calitem_end
            FROM rcalitem
           WHERE (rcalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
           UNION
          SELECT acalitem_id AS calitem_id,
                 findPeriodStart(acalitem_id) AS calitem_start,
                 findPeriodEnd(acalitem_id) AS calitem_end
            FROM acalitem
           WHERE (acalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
        ) AS calitem
 WHERE ((cohead_orderdate BETWEEN
 <? foreach("period_id_list") ?>
   <? if isfirst("period_id_list") ?>
     findPeriodStart(<? value("period_id_list") ?>)
   <? endif ?>
   <? if isLast("period_id_list") ?>
     AND findPeriodEnd(<? value("period_id_list") ?>)
   <? endif ?>
 <? endforeach ?>
 )
     AND (coitem_status != 'X')
+<? if exists("item_id") ?>
+    AND (item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("cust_id") ?>
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id
                               FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
     AND(itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
       )
 ORDER BY pstart, f_number, f_description, f_uom, warehous_code) list
 LEFT OUTER JOIN
 -- Bookings calcuations
 -- Loop through each period bucket to find bookings for period
 (<? foreach("period_id_list") ?>
   SELECT
        <? value("period_id_list") ?> AS calitem_id,
        warehous_id,
 <? if exists("byCust") ?>
          cust_id
 <? elseif exists("byProdcat") ?>
          prodcat_id
 <? elseif exists("byItem") ?>
          item_id
 <? endif ?>
 <? if exists("salesDollars") ?>
        , sum(round((coitem_qtyord * coitem_qty_invuomratio) * (currtobase(cohead_curr_id, coitem_price, cohead_orderdate) / coitem_price_invuomratio), 2)) AS unit
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
        , sum(coitem_qtyord)
   <? if exists("capacityUnits") ?>
        * itemcapinvrat(item_id)
   <? elseif exists("altCapacityUnits") ?>
        * itemaltcapinvrat(item_id)
   <? endif ?>
        AS unit
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
   FROM coitem
    JOIN cohead ON (coitem_cohead_id=cohead_id)
    JOIN itemsite ON (coitem_itemsite_id=itemsite_id)
    JOIN item ON (itemsite_item_id=item_id)
 <? if exists("inventoryUnits") ?>
    JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
    JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
    JOIN custinfo ON (cohead_cust_id=cust_id)
 <? endif ?>
 <? if reExists("[pP]rodcat") ?>
    JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
   WHERE ((cohead_orderdate BETWEEN findPeriodStart(<? value("period_id_list") ?>) AND findPeriodEnd(<? value("period_id_list") ?>))
     AND (coitem_status != 'X')
+<? if exists("item_id") ?>
+    AND (item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("cust_id") ?>
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id
                               FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
     AND(itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
       )
 GROUP BY
 <? if exists("byCust") ?>
   cust_id,
 <? elseif exists("byProdcat") ?>
   prodcat_id,
 <? elseif exists("byItem") ?>
   item_id,
 <? endif ?>
   f_uom, warehous_id
   <? if isLast("period_id_list") ?>
   <? else ?>
 UNION
   <? endif ?>
 <? endforeach ?>
 ) bookings ON
 <? if exists("byCust") ?>
    (list.cust_id=bookings.cust_id)
 <? elseif exists("byProdcat") ?>
     (list.prodcat_id=bookings.prodcat_id)
 <? elseif exists("byItem") ?>
     (list.item_id=bookings.item_id)
 <? endif ?>
    AND (list.calitem_id=bookings.calitem_id)
    AND (list.warehous_id=bookings.warehous_id)
    AND (list.f_uom=bookings.f_uom)

 --------------------------------------------------------------------
 REPORT: TimePhasedSalesHistory
 QUERY: detail
 SELECT *,
   coalesce(unit,0) AS unit,
 <? if exists("salesDollars") ?>
   formatExtPrice(coalesce(unit,0)) AS f_unit
 <? else ?>
   formatQty(coalesce(unit,0)) AS f_unit
 <? endif ?>
 FROM
 -- Outer Table Query
 (SELECT DISTINCT
        calitem_id,
        findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
 <? if exists("byCust") ?>
          cust_id, cust_number AS f_number, cust_name AS f_description
 <? elseif exists("byProdcat") ?>
          prodcat_id, prodcat_code AS f_number, prodcat_descrip AS f_description
 <? elseif exists("byItem") ?>
          item_id, item_number AS f_number, item_descrip1 AS f_description
 <? endif ?>
        , warehous_id, warehous_code
 <? if exists("salesDollars") ?>
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
 FROM cohist JOIN itemsite ON (itemsite_id=cohist_itemsite_id)
             JOIN item ON (item_id=itemsite_item_id)
 <? if exists("inventoryUnits") ?>
  JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
  JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
  JOIN custinfo ON (cohist_cust_id=cust_id)
 <? endif ?>
 <? if reExists("[pP]rodcat") ?>
  JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
 <? if reExists("custgrp") ?>
  JOIN custgrpitem ON (custgrpitem_cust_id=cohist_cust_id)
  JOIN custgrp ON (custgrpitem_custgrp_id=custgrp_id)
 <? endif ?>
     ,   ( SELECT rcalitem_id AS calitem_id,
                 findPeriodStart(rcalitem_id) AS calitem_start,
                 findPeriodEnd(rcalitem_id) AS calitem_end
            FROM rcalitem
           WHERE (rcalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
           UNION
          SELECT acalitem_id AS calitem_id,
                 findPeriodStart(acalitem_id) AS calitem_start,
                 findPeriodEnd(acalitem_id) AS calitem_end
            FROM acalitem
           WHERE (acalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
        ) AS calitem
 WHERE ((cohist_invcdate BETWEEN
 <? foreach("period_id_list") ?>
   <? if isfirst("period_id_list") ?>
     findPeriodStart(<? value("period_id_list") ?>)
   <? endif ?>
   <? if isLast("period_id_list") ?>
     AND findPeriodEnd(<? value("period_id_list") ?>)
   <? endif ?>
 <? endforeach ?>
 )
+<? if exists("item_id") ?>
+    AND (item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("cust_id") ?>
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id
                               FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("custgrp_id") ?>
     AND (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? endif ?>
 <? if exists("custgrp_pattern") ?>
     AND (cust_custgrp_name ~ <? value("custgrp_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
     AND(itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
       )
 ORDER BY pstart, f_number, f_description, f_uom, warehous_code) list
 LEFT OUTER JOIN
 -- Sales calcuations
 -- Loop through each period bucket to find bookings for period
 (<? foreach("period_id_list") ?>
   SELECT
        <? value("period_id_list") ?> AS calitem_id,
        warehous_id,
 <? if exists("byCust") ?>
          cust_id
 <? elseif exists("byProdcat") ?>
          prodcat_id
 <? elseif exists("byItem") ?>
          item_id
 <? endif ?>
 <? if exists("salesDollars") ?>
        , sum(round(cohist_qtyshipped * currtobase(cohist_curr_id, cohist_unitprice, cohist_invcdate), 2)) AS unit
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
        , sum(cohist_qtyshipped)
   <? if exists("capacityUnits") ?>
        * itemcapinvrat(item_id)
   <? elseif exists("altCapacityUnits") ?>
        * itemaltcapinvrat(item_id)
   <? endif ?>
        AS unit
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
 FROM cohist JOIN itemsite ON (itemsite_id=cohist_itemsite_id)
             JOIN item ON (item_id=itemsite_item_id)
 <? if exists("inventoryUnits") ?>
    JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
    JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
    JOIN custinfo ON (cohist_cust_id=cust_id)
 <? endif ?>
 <? if reExists("[pP]rodcat") ?>
    JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
 <? if reExists("custgrp") ?>
  JOIN custgrpitem ON (custgrpitem_cust_id=cohist_cust_id)
  JOIN custgrp ON (custgrpitem_custgrp_id=custgrp_id)
 <? endif ?>
   WHERE ((cohist_invcdate BETWEEN findPeriodStart(<? value("period_id_list") ?>) AND findPeriodEnd(<? value("period_id_list") ?>))
+<? if exists("item_id") ?>
+    AND (item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("cust_id") ?>
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id
                               FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("custgrp_id") ?>
     AND (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? endif ?>
 <? if exists("custgrp_pattern") ?>
     AND (cust_custgrp_name ~ <? value("custgrp_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
     AND(itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
       )
 GROUP BY
 <? if exists("byCust") ?>
   cust_id,
 <? elseif exists("byProdcat") ?>
   prodcat_id,
 <? elseif exists("byItem") ?>
   item_id,
 <? endif ?>
   f_uom, warehous_id
   <? if isLast("period_id_list") ?>
   <? else ?>
 UNION
   <? endif ?>
 <? endforeach ?>
 ) sales ON
 <? if exists("byCust") ?>
    (list.cust_id=sales.cust_id)
 <? elseif exists("byProdcat") ?>
     (list.prodcat_id=sales.prodcat_id)
 <? elseif exists("byItem") ?>
     (list.item_id=sales.item_id)
 <? endif ?>
    AND (list.calitem_id=sales.calitem_id)
    AND (list.warehous_id=sales.warehous_id)
    AND (list.f_uom=sales.f_uom)

 --------------------------------------------------------------------
 REPORT: VendorInformation
 QUERY: OpenBalance
-SELECT formatMoney((apopen_amount-apopen_paid) / apopen_curr_rate *
+SELECT formatMoney(COALESCE(SUM((apopen_amount-apopen_paid) / apopen_curr_rate *
                       CASE WHEN (apopen_doctype IN ('D','V')) THEN 1
-                      ELSE -1 END) AS balance
+                      ELSE -1 END), 0.0)) AS balance
                     FROM apopen
                     WHERE ((apopen_open)
                        AND (apopen_vend_id=<? value("vend_id") ?>));
+

 --------------------------------------------------------------------
 REPORT: WOLabel
 QUERY: detail
 SELECT
  sequence_value,
  formatDate(wo_duedate) AS due_date,
  item_number,
  item_descrip1,
- prodcat_descrip
- FROM
- wo,
- itemsite,
- item,
- prodcat,
- sequence
-WHERE ( (wo_itemsite_id = itemsite_id)
-AND (wo_id=<? value("wo_id") ?>)
-AND (item_prodcat_id = prodcat_id)
-AND (itemsite_item_id = item_id)
-AND (sequence.sequence_value
-BETWEEN 1 AND <? value("labelTo") ?>));
+ COALESCE(prodcat_descrip, '') AS prodcat_descrip
+ FROM wo JOIN itemsite ON (itemsite_id=wo_itemsite_id)
+         JOIN item ON (item_id=itemsite_item_id)
+         JOIN sequence ON (sequence.sequence_value BETWEEN 1 AND <? value("labelTo") ?>)
+         LEFT OUTER JOIN prodcat ON (prodcat_id=item_prodcat_id)
+WHERE (wo_id=<? value("wo_id") ?>);
+

 --------------------------------------------------------------------
 REPORT: Items
 QUERY: detail
-SELECT DISTINCT ON (item_number)
+SELECT
+       <? if exists("ListNumericItemNumbersFirst") ?>
+         DISTINCT ON ( toNumeric(item_number, 999999999999999), item_number )
+       <? else ?>
+         DISTINCT ON ( item_number )
+       <? endif ?>
        item_number,
        item_descrip1,
        item_descrip2,
        formatBoolYN(item_active) AS active,
        CASE WHEN (item_type='M') THEN 'Manufactured'
             WHEN (item_type='P') THEN 'Purchased'
             WHEN (item_type='F') THEN 'Phantom'
             WHEN (item_type='B') THEN 'Breeder'
             WHEN (item_type='C') THEN 'Co-Product'
             WHEN (item_type='Y') THEN 'By-Product'
             WHEN (item_type='R') THEN 'Reference'
             WHEN (item_type='T') THEN 'Tooling'
             WHEN (item_type='O') THEN 'Outside Process'
             WHEN (item_type='J') THEN 'Job'
             WHEN (item_type='K') THEN 'Kit'
             WHEN (item_type='L') THEN 'Planning'
             ELSE item_type
        END AS itemtype,
        iuom.uom_name AS invuom,
        itemcapuom(item_id) AS capuom,
        itemaltcapuom(item_id) AS altcapuom,
        puom.uom_name AS priceuom,
        puom.uom_name AS shipuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        formatRatio(iteminvpricerat(item_id)) AS shipratio,
        formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        classcode_code
 FROM item
   JOIN classcode ON (item_classcode_id=classcode_id)
   JOIN uom iuom ON (item_inv_uom_id=iuom.uom_id)
   JOIN uom puom ON (item_price_uom_id=puom.uom_id)
 <? if exists("itemgrp_id") ?>
   JOIN itemgrpitem ON (item_id=itemgrpitem_item_id)
   JOIN itemgrp ON (itemgrp_id=itemgrpitem_itemgrp_id)
 <? endif ?>
 <? foreach("char_id_text_list") ?>
   LEFT OUTER JOIN charass charass_alias<? literal("char_id_text_list") ?>
     ON ((charass_alias<? literal("char_id_text_list") ?>.charass_target_type='I')
     AND  (charass_alias<? literal("char_id_text_list") ?>.charass_target_id=item_id)
     AND  (charass_alias<? literal("char_id_text_list") ?>.charass_char_id=<? value("char_id_text_list") ?>))
   LEFT OUTER JOIN char char_alias<? literal("char_id_text_list") ?>
     ON (charass_alias<? literal("char_id_text_list") ?>.charass_char_id=char_alias<? literal("char_id_text_list") ?>.char_id)
 <? endforeach ?>
 <? foreach("char_id_list_list") ?>
   LEFT OUTER JOIN charass charass_alias<? literal("char_id_list_list") ?>
     ON ((charass_alias<? literal("char_id_list_list") ?>.charass_target_type='I')
     AND  (charass_alias<? literal("char_id_list_list") ?>.charass_target_id=item_id)
     AND  (charass_alias<? literal("char_id_list_list") ?>.charass_char_id=<? value("char_id_list_list") ?>))
   LEFT OUTER JOIN char char_alias<? literal("char_id_list_list") ?>
     ON (charass_alias<? literal("char_id_list_list") ?>.charass_char_id=char_alias<? literal("char_id_list_list") ?>.char_id)
+<? endforeach ?>
 <? foreach("char_id_date_list") ?>
   LEFT OUTER JOIN charass charass_alias<? literal("char_id_date_list") ?>
     ON ((charass_alias<? literal("char_id_date_list") ?>.charass_target_type='I')
     AND  (charass_alias<? literal("char_id_date_list") ?>.charass_target_id=item_id)
     AND  (charass_alias<? literal("char_id_date_list") ?>.charass_char_id=<? value("char_id_date_list") ?>))
   LEFT OUTER JOIN char char_alias<? literal("char_id_date_list") ?>
     ON (charass_alias<? literal("char_id_date_list") ?>.charass_char_id=char_alias<? literal("char_id_date_list") ?>.char_id)
 <? endforeach ?>
 WHERE ( true
 <? if exists("search_pattern") ?>
  AND ( (item_number ~* <? value("search_pattern") ?>)
        OR  (item_descrip1 || item_descrip2 ~* <? value("search_pattern") ?>) )
 <? endif ?>
 <? if exists("showPurchased") ?>
  AND (item_type IN ('P', 'O'))
 <? elseif exists("showManufactured") ?>
  AND (item_type IN ('M', 'F', 'B','K'))
 <? elseif exists("showSold") ?>
  AND (item_sold)
 <? endif ?>
 <? if not exists("showInactive") ?>
  AND (item_active)
 <? endif ?>
 <? if exists("classcode_id") ?>
  AND (item_classcode_id=<? value("classcode_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
  AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("freightclass_id") ?>
  AND (item_freightclass_id=<? value("freightclass_id") ?>)
 <? endif ?>
 <? if exists("itemgrp_id") ?>
  AND (itemgrp_id=<? value("itemgrp_id") ?>)
 <? endif ?>
 <? if exists("item_number_pattern") ?>
  AND (item_number ~* <? value("item_number_pattern") ?>)
 <? endif ?>
 <? if exists("item_descrip_pattern") ?>
  AND (item_descrip1 || item_descrip2 ~* <? value("item_descrip_pattern") ?>)
 <? endif ?>
 <? if exists("classcode_pattern") ?>
  AND (classcode_code ~* <? value("classcode_pattern") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
  AND (prodcat_code  ~* <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if exists("freightclass_pattern") ?>
  AND (freightclass_code ~* <? value("freightclass_pattern") ?>)
 <? endif ?>
 <? literal("charClause") ?>
 ) ORDER BY
 <? if exists("ListNumericItemNumbersFirst") ?>
  toNumeric(item_number, 999999999999999),
 <? endif ?>
  item_number;