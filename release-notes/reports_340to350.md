--------------------------------------------------------------------
REMOVED REPORTS:
BalanceSheet
IncomeStatement
--------------------------------------------------------------------
NEW REPORTS:
Incident
MetaSQLMasterList
ReturnAuthorizationWorkbenchDueCredit
ReturnAuthorizationWorkbenchReview
--------------------------------------------------------------------
CHANGED REPORTS:
APOpenItemsByVendor
ARAging
AROpenItems
BillingEditList
BriefEarnedCommissions
CashReceiptsJournal
CostedIndentedBOM
CostedSingleLevelBOM
CostedSummarizedBOM
CountTagEditList
CreditMemo
GLTransactions
IndentedBOM
IndentedWhereUsed
Invoice
ItemsByCharacteristic
ItemsByClassCode
ItemsByProductCategory
MaterialUsageVarianceByBOMItem
MaterialUsageVarianceByComponentItem
MaterialUsageVarianceByItem
MaterialUsageVarianceByWarehouse
MaterialUsageVarianceByWorkOrder
OrderActivityByProject
PackingList-Shipment
PendingBOMChanges
PendingWOMaterialAvailability
PurchaseOrder
PurchaseReqsByPlannerCode
PurchaseRequestsByItem
QOHByParameterList
SelectPaymentsList
SingleLevelBOM
SingleLevelWhereUsed
SummarizedBOM
TimePhasedOpenARItems
UninvoicedShipments
ValidLocationsByItem
WOMaterialAvailabilityByWorkOrder
WOMaterialRequirementsByComponentItem
WOMaterialRequirementsByWorkOrder


 --------------------------------------------------------------------
 REPORT: APOpenItemsByVendor
 QUERY: detail
 SELECT apopen_id, apopen_ponumber, apopen_docnumber,
                     CASE WHEN (apopen_doctype='C') THEN <? value("creditMemo") ?>
                          WHEN (apopen_doctype='D') THEN <? value("debitMemo") ?>
                          WHEN (apopen_doctype='V') THEN <? value("voucher") ?>
                          ELSE <? value("other") ?>
                     END AS f_doctype,
                     apopen_invcnumber AS invoicenumber,
                     formatDate(apopen_docdate) AS f_docdate,
                     formatDate(apopen_duedate) AS f_duedate,
                     formatMoney(apopen_amount) AS f_amount,
                     formatMoney(apopen_paid - COALESCE(SUM(apapply_target_paid),0)) AS f_paid,
                     formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0)) *
                     CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
                     END) AS f_balance,
                     currConcat(apopen_curr_id) AS currAbbr,
                     (apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
                     / apopen_curr_rate * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
                          END) AS base_balance,
                     formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
                     / apopen_curr_rate * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
-                         END)) AS f_base_balance
+                         END)) AS f_base_balance,
+                  CASE WHEN (apopen_status='O') THEN TEXT('Open')
+                    ELSE CASE WHEN (apopen_status='H') THEN TEXT('On Hold')
+                      ELSE CASE WHEN (apopen_status='C') THEN TEXT('Close')
+                      END
+                    END
+                  END AS status
              FROM apopen
                LEFT OUTER JOIN apapply ON (((apopen_id=apapply_target_apopen_id)
                                        OR (apopen_id=apapply_source_apopen_id))
                                        AND (apapply_postdate > <? value("asofDate") ?>))
               WHERE ( (COALESCE(apopen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
                 AND   (apopen_docdate<=<? value("asofDate") ?>)
                 AND   (apopen_vend_id=<? value("vend_id") ?>)
                 AND   (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
               GROUP BY apopen_id, apopen_ponumber, apopen_docnumber,apopen_doctype, apopen_invcnumber, apopen_docdate,
-                apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_curr_rate
+                apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_curr_rate, apopen_status
               ORDER BY apopen_docdate;

 --------------------------------------------------------------------
 REPORT: ARAging
 QUERY: detail
 SELECT
 	araging_docdate,
 	araging_duedate,
 	araging_ponumber,
 	araging_docnumber,
 	araging_doctype,
 	araging_cust_id,
 	araging_cust_number,
 	araging_cust_name,
 	araging_cust_custtype_id,
 	araging_custtype_code,
 	araging_terms_descrip,
 	formatMoney(araging_aropen_amount) AS araging_aropen_amount,
 	araging_cur_val,   formatMoney(araging_cur_val)    AS araging_cur_amt,
 	araging_thirty_val,formatMoney(araging_thirty_val) AS araging_thirty_amt,
 	araging_sixty_val, formatMoney(araging_sixty_val)  AS araging_sixty_amt,
 	araging_ninety_val,formatMoney(araging_ninety_val) AS araging_ninety_amt,
 	araging_plus_val,  formatMoney(araging_plus_val)   AS araging_plus_amt,
 	araging_total_val, formatMoney(araging_total_val)  AS araging_total_amt
 FROM araging(<? value("relDate") ?>, <? value("useDocDate") ?>)
+      LEFT OUTER JOIN custgrpitem ON (araging_cust_id=custgrpitem_cust_id)
 <? if exists("cust_id") ?>
    WHERE (araging_cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    WHERE (araging_cust_custtype_id=<? value("custtype_id") ?>)
+<? elseif exists("custgrp_id") ?>
+WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    WHERE (araging_custtype_code ~ <? value("custtype_pattern") ?>)
 <? endif ?>;

 --------------------------------------------------------------------
 REPORT: AROpenItems
 QUERY: head
 SELECT
 formatDate(<? value("asofDate") ?>) AS asOfDate,
 <? if exists("creditsOnly") ?>
   'Credits Only' AS type,
 <? elseif exists("debitsOnly") ?>
   'Debits Only' AS type,
 <? else ?>
   'Debits and Credits' AS type,
 <? endif ?>
 <? if exists("cust_id") ?>
   (SELECT cust_name FROM custinfo WHERE cust_id=<? value("cust_id") ?>) AS selection,
 <? elseif exists("custtype_id") ?>
   (SELECT custtype_code FROM custtype WHERE custtype_id=<? value("custtype_id") ?>) AS selection,
 <? elseif exists("custtype_pattern") ?>
   ('Customer Type pattern = ' || <? value("custtype_pattern") ?>) AS selection,
+<? elseif exists("custgrp_id") ?>
+  (SELECT custgrp_name FROM custgrp WHERE
+ custgrp_id=<? value("custgrp_id") ?>) AS selection,
 <? else ?>
   'All Customers' AS selection,
 <? endif ?>
 <? if exists("startDate") ?>
       'Start Doc Date:' AS start_label,
       'End Doc Date:' AS end_label,
 <? else ?>
       'Start Due Date:' AS start_label,
       'End Due Date:' AS end_label,
 <? endif ?>
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        currConcat(baseCurrId()) AS baseAbbr,
 <? if exists("incidentsOnly") ?>
   'Yes' AS incidentsOnly
 <? else ?>
   'No' AS incidentsOnly
 <? endif ?>;

 --------------------------------------------------------------------
 REPORT: BillingEditList
 QUERY: detail
 SELECT cohead_id			AS orderid,
        -2				AS itemid,
        CASE WHEN (formatInvcNumber(cobmisc_id) <> '') THEN ('Invc-' || formatInvcNumber(cobmisc_id))
             ELSE '?'
        END 				AS documentnumber,
        cust_number			AS name,
        cohead_billtoname 		AS descrip,
        text(cohead_number) 		AS f_ordernumber,
        cohead_number 			AS ordernumber,
        -1 				AS linenumber,
        '' 				AS iteminvuom,
        '' 				AS qtytobill,
        '' 				AS price,
        '' 				AS extprice,
        0			        AS subextprice,
        0			        AS runningextprice,
        COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                    FROM accnt
                    WHERE (accnt_id=findARAccount(cust_id)) ), 'Not Assigned') AS debit,
        '' AS credit,
        currConcat(cobmisc_curr_id)      AS currabbr
 FROM cobmisc, cohead, cust
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (cohead_cust_id=cust_id)
  AND (NOT cobmisc_posted)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT cohead_id 			AS orderid,
        -1 				AS itemid,
        '' 				AS documentnumber,
        'Freight'			AS name,
        'Freight Charge' 		AS descrip,
        ''		 		AS f_ordernumber,
        cohead_number			AS ordernumber,
        -1 				AS linenumber,
        '' 				AS iteminvuom,
        '' 				AS qtytobill,
        formatExtPrice(cobmisc_freight) 	AS price,
        formatExtPrice(cobmisc_freight) 	AS extprice,
        cobmisc_freight			AS subextprice,
        currtobase(cobmisc_curr_id, cobmisc_freight, cobmisc_invcdate) AS runningextprice,
        '' AS debit,
        (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
        currConcat(cobmisc_curr_id)      AS currabbr
 FROM cobmisc, cohead, accnt AS freight
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (freight.accnt_id=findFreightAccount(cohead_cust_id))
  AND (NOT cobmisc_posted)
  AND (cobmisc_freight <> 0)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT cohead_id 								AS orderid,
 	-1 									AS itemid,
         '' 									AS documentnumber,
         'Misc. Charge'								AS name,
 	cohead_misc_descrip 							AS descrip,
         ''		 							AS f_ordernumber,
 	cohead_number								AS ordernumber,
 	-1 									AS linenumber,
 	'' 									AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cobmisc_misc) 						AS price,
         formatExtPrice(cobmisc_misc) 						AS extprice,
 	cobmisc_misc								AS subextprice,
 	currToBase(cobmisc_curr_id, cobmisc_misc, cobmisc_invcdate)				AS runningextprice,
        '' AS debit,
         (formatGLAccount(misc.accnt_id) || ' - ' || misc.accnt_descrip) 	AS credit,
         currConcat(cobmisc_curr_id)     AS currabbr
 FROM cobmisc, cohead, accnt AS misc
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (cobmisc_misc_accnt_id=misc.accnt_id)
  AND (NOT cobmisc_posted)
  AND (cobmisc_misc <> 0)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT  cohead_id 								AS orderid,
 	-1 									AS itemid,
         '' 									AS documentnumber,
         'Sales Tax'								AS name,
-	tax_descrip	 							AS descrip,
+	''		 							AS descrip,
         ''		 							AS f_ordernumber,
 	cohead_number								as ordernumber,
 	-1				 					AS linenumber,
 	''						 			AS iteminvuom,
         '' 									AS qtytobill,
-        formatExtPrice(cobmisc_tax) 						AS price,
-        formatExtPrice(cobmisc_tax) 						AS extprice,
-	cobmisc_tax								AS subextprice,
-	currtobase(cobmisc_tax_curr_id, cobmisc_tax, cobmisc_invcdate)				AS runningextprice,
+        formatExtPrice(calcCobmiscTax(cobmisc_id))				AS price,
+        formatExtPrice(calcCobmiscTax(cobmisc_id))				AS extprice,
+	calcCobmiscTax(cobmisc_id)						AS subextprice,
+	currtobase(cobmisc_tax_curr_id, calcCobmiscTax(cobmisc_id), cobmisc_invcdate) AS runningextprice,
        '' AS debit,
-        (formatGLAccount(taxaccnt.accnt_id) || ' - ' || taxaccnt.accnt_descrip) AS credit,
+       '' AS credit,
         currConcat(cobmisc_tax_curr_id)     AS currabbr
-FROM cobmisc, cohead, coitem, tax, accnt AS taxaccnt
+FROM cobmisc, cohead
 WHERE ( (cobmisc_cohead_id=cohead_id)
- AND (coitem_cohead_id=cohead_id)
- AND (tax_id=coitem_tax_id)
- AND (tax_sales_accnt_id=taxaccnt.accnt_id)
  AND (NOT cobmisc_posted)
- AND (cobmisc_tax <> 0)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT  cohead_id 								AS orderid,
 	coitem_id 								AS itemid,
         '' 									AS documentnumber,
         item_number								AS name,
 	(item_descrip1 || ' ' || item_descrip2)					AS descrip,
         ''		 							AS f_ordernumber,
         cohead_number	 							AS ordernumber,
 	coitem_linenumber 							AS linenumber,
 	uom_name AS iteminvuom,
         formatQty(cobill_qty) 							AS qtytobill,
         formatPrice(coitem_price) 						AS price,
         formatExtPrice((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) 		AS extprice,
 	((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio))			AS subextprice,
 	currtobase(cobmisc_curr_id, ((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)), cobmisc_invcdate) AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cohead_cust_id)))), 'Not Assigned') AS credit,
         currConcat(cobmisc_curr_id)     AS currabbr
 FROM item, itemsite, cobmisc, cohead, cobill, coitem, uom
 WHERE ( (coitem_itemsite_id=itemsite_id)
  AND (cobill_coitem_id=coitem_id)
  AND (cobill_cobmisc_id=cobmisc_id)
  AND (cobmisc_cohead_id=cohead_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (cobill_cobmisc_id=cobmisc_id)
  AND (NOT cobmisc_posted)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT 	cmhead_id 					AS orderid,
 	-2 						AS itemid,
         ('C/M-' || formatCreditMemoNumber(cmhead_id)) 	AS documentnumber,
         cust_number					AS name,
 	cmhead_billtoname 				AS descrip,
         text(cmhead_number) 				AS f_ordernumber,
 	cmhead_number					AS ordernumber,
 	-1 						AS linenumber,
 	'' 						AS iteminvuom,
         '' 						AS qtytobill,
         '' 						AS price,
         '' 						AS extprice,
 	0						AS subextprice,
 	0						AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt
                     WHERE (accnt_id=findARAccount(cmhead_cust_id)) ), 'Not Assigned') AS credit,
         currConcat(cmhead_curr_id)     AS currabbr
 FROM cmhead, cust
 WHERE ( (cmhead_cust_id=cust_id)
  AND (NOT cmhead_posted)
  AND (NOT cmhead_hold)
 <? if exists("showPrinted") ?>
  AND (cmhead_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cmhead_printed)
 <? endif ?>
 )

 UNION
 SELECT  cmhead_id 								AS orderid,
 	-1 									AS itemid,
         '' 									AS documentnumber,
         'Freight'								AS name,
 	'Freight Charge'							AS descrip,
         ''		 							AS f_ordernumber,
         cmhead_number	 							AS ordernumber,
 	-1 									AS linenumber,
 	'' 									AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cmhead_freight) 						AS price,
         formatExtPrice(cmhead_freight) 						AS extprice,
 	(cmhead_freight * -1)							AS subextprice,
 	currtobase(cmhead_curr_id, cmhead_freight * -1, cmhead_gldistdate)				AS runningextprice,
         (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
         '' AS debit,
         currConcat(cmhead_curr_id)     AS currabbr
 FROM cmhead, accnt AS freight
 WHERE ( (freight.accnt_id=findFreightAccount(cmhead_cust_id))
  AND (NOT cmhead_posted)
  AND (NOT cmhead_hold)
  AND (cmhead_freight <> 0)
 <? if exists("showPrinted") ?>
  AND (cmhead_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cmhead_printed)
 <? endif ?>
 )

 UNION
 SELECT  cmhead_id 								AS orderid,
 	cmitem_id 								AS itemid,
         '' 									AS documentnumber,
         item_number								AS name,
 	(item_descrip1 || ' ' || item_descrip2)					AS descrip,
         ''		 							AS f_ordernumber,
         cmhead_number	 							AS ordernumber,
 	cmitem_linenumber 							AS linenumber,
 	uom_name                                                                AS iteminvuom,
         formatQty(cmitem_qtycredit) 						AS qtytobill,
         formatPrice(cmitem_unitprice) 						AS price,
         formatExtPrice((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio)) 	AS extprice,
 	((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1)			AS subextprice,
 	currtobase(cmhead_curr_id, ((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1), cmhead_gldistdate) AS runningextprice,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cmhead_cust_id)))), 'Not Assigned') AS credit,
         '' AS debit,
         currConcat(cmhead_curr_id)     AS currabbr
 FROM item, itemsite, cmhead, cmitem, uom
 WHERE ( (cmitem_itemsite_id=itemsite_id)
  AND (cmitem_cmhead_id=cmhead_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (NOT cmhead_posted)
  AND (NOT cmhead_hold)
 <? if exists("showPrinted") ?>
  AND (cmhead_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cmhead_printed)
 <? endif ?>
 )

 ORDER BY ordernumber, linenumber;

 --------------------------------------------------------------------
 REPORT: BriefEarnedCommissions
 QUERY: detail
 SELECT cohist_salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
        cohist_ordernumber, cohist_invcnumber, formatDate(cohist_invcdate) AS f_invcdate, currAbbr,
        formatMoney(SUM(baseextprice)) AS f_extprice,
        formatMoney(SUM(basecommission)) AS f_commission,
        SUM(baseextprice) AS extprice,
        SUM(basecommission) AS commission
 <? if exists("includeMisc") ?>
 FROM saleshistorymisc
 <? else ?>
 FROM saleshistory
 <? endif ?>
 WHERE ( (cohist_commission <> 0)
   AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)

 <? if exists("includeMisc") ?>
   AND (COALESCE(cohist_misc_type, '') <> 'T')
   AND (COALESCE(cohist_misc_type, '') <> 'F')
 <? endif ?>

 <? if exists("salesrep_id") ?>
-  AND (salesrep_id=<? value("salesrep_id") ?>)
+  AND (cohist_salesrep_id=<? value("salesrep_id") ?>)
 <? endif ?>
 )
 GROUP BY cohist_salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
          cohist_ordernumber, cohist_invcnumber, cohist_invcdate, currAbbr
 ORDER BY salesrep_number, cust_number, cohist_invcdate

 --------------------------------------------------------------------
 REPORT: CashReceiptsJournal
 QUERY: detail
 SELECT cust_number,
        cust_name,
        arapply_source_doctype,
        arapply_source_docnumber,
        arapply_target_doctype,
        arapply_target_docnumber,
        arapply_fundstype,
        arapply_refnumber,
        formatMoney(arapply_applied) AS f_amount,
        formatBoolYN(arapply_closed) AS f_closed
   FROM arapply LEFT OUTER JOIN cust ON (arapply_cust_id=cust_id)
- WHERE ((arapply_postdate = CURRENT_DATE)
-   AND  (arapply_journalnumber=text(<? value("journalNumber") ?>))
+ WHERE ((arapply_journalnumber=text(<? value("journalNumber") ?>))
 )
 UNION
 SELECT cust_number,
        cust_name,
        substr(aropen_notes,16,1),
        substr(aropen_notes,18),
        '', TEXT('Unapplied'),
        substr(aropen_notes,16,1),
        substr(aropen_notes,18),
        formatMoney(aropen_amount),
        ''
   FROM aropen LEFT OUTER JOIN cust ON (aropen_cust_id=cust_id)
- WHERE ((aropen_docdate = CURRENT_DATE)
-   AND  (aropen_journalnumber=<? value("journalNumber") ?>)
+ WHERE ((aropen_journalnumber=<? value("journalNumber") ?>)
 )

 --------------------------------------------------------------------
 REPORT: CostedIndentedBOM
 QUERY: head
 SELECT item_number,
        uom_name AS item_invuom,
        item_descrip1,
        item_descrip2,
        <? if exists("useActualCosts") ?>
          text('Using Actual Costs')
        <? else ?>
          text('Using Standard Costs')
        <? endif ?>
        AS lbl_usecosts,
+       (select formatCost(sum(extendedcost)) from
+(select CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_stdextendedcost
+            ELSE 0
+       END AS extendedcost,
+       bomdata_bomwork_level
+FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,0,0))foo) as t_extendedcost,
        formatCost(actcost(item_id)) AS f_actual,
        formatCost(stdcost(item_id)) AS f_standard
   FROM item JOIN uom ON (uom_id=item_inv_uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 select (REPEAT(' ',(bomdata_bomwork_level-1)*3) || bomdata_bomwork_seqnumber) AS f_seqnumber,
        1 AS seq_ord,
        bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
        bomdata_createchild as createchild,
        bomdata_issuemethod AS issuemethod,
-       formatQtyPer(bomdata_qtyper) AS qtyper,
+       formatQtyPer(bomdata_qtyreq) AS qtyreq,
        formatScrap(bomdata_scrap) AS scrap,
        CASE WHEN COALESCE(bomdata_effective, startOfTime()) <= startOfTime() THEN
                  <? value("always") ?>
             ELSE formatDate(bomdata_effective)
        END AS effective,
        CASE WHEN COALESCE(bomdata_expires, endOfTime()) <= endOfTime() THEN
                  <? value("never") ?>
             ELSE formatDate(bomdata_expires)
        END AS expires,
 <? if exists("useActualCosts") ?>
        formatCost(bomdata_actunitcost) AS f_unitcost,
        formatCost(bomdata_actextendedcost) AS f_extendedcost,
        CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_actextendedcost
             ELSE 0
        END AS extendedcost,
 <? else ?>
        formatCost(bomdata_stdunitcost) AS f_unitcost,
        formatCost(bomdata_stdextendedcost) AS f_extendedcost,
        CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_stdextendedcost
             ELSE 0
        END AS extendedcost,
 <? endif ?>
        bomdata_bomwork_level
 FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,0,0);

 --------------------------------------------------------------------
 REPORT: CostedSingleLevelBOM
 QUERY: detail
 SELECT bomdata_bomwork_seqnumber AS orderby,
   CASE WHEN bomdata_bomwork_seqnumber > 0 THEN
     text(bomdata_bomwork_seqnumber)
   ELSE NULL
   END AS seqnumber,
   bomdata_item_number AS item_number,
   bomdata_uom_name AS item_invuom,
   bomdata_item_descrip1 AS item_descrip1,
   bomdata_item_descrip2 AS item_descrip2,
   bomdata_issuemethod AS issuemethod,
+  formatQty(bomdata_qtyfxd) AS qtyfxd,
   formatQtyPer(bomdata_qtyper) AS qtyper,
   formatScrap(bomdata_scrap) AS scrap,
   CASE
     WHEN item_inv_uom_id IS NOT NULL THEN
-      formatqtyper(bomitem_qtyper * (1 + bomitem_scrap) * itemuomtouomratio(bomitem_item_id,bomitem_uom_id,item_inv_uom_id))
+      formatqtyper((bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap) * itemuomtouomratio(bomitem_item_id,bomitem_uom_id,item_inv_uom_id))
     ELSE
       ''
   END AS qtyreq,
   CASE WHEN COALESCE(bomdata_effective, startOfTime()) <= startOfTime() THEN
              <? value("always") ?>
        ELSE formatDate(bomdata_effective)
   END AS effective,
   CASE WHEN COALESCE(bomdata_expires, endOfTime()) >= endOfTime() THEN
              <? value("never") ?>
        ELSE formatDate(bomdata_expires)
   END AS expires,
 <? if exists("useActualCosts") ?>
   formatCost(bomdata_actunitcost)
 <? else ?>
   formatCost(bomdata_stdunitcost)
 <? endif ?>
   AS unitcost,
 <? if exists("useActualCosts") ?>
   formatCost(bomdata_actextendedcost)
 <? else ?>
   formatCost(bomdata_stdextendedcost)
 <? endif ?>
   AS extcost
 FROM singlelevelbom(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
   LEFT OUTER JOIN bomitem ON (bomdata_bomitem_id=bomitem_id)
   LEFT OUTER JOIN item ON (bomitem_item_id=item_id)
 ORDER BY orderby;

 --------------------------------------------------------------------
 REPORT: CostedSummarizedBOM
 QUERY: detail
 select bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
-       formatQtyPer(bomdata_qtyper) AS qtyper,
+       formatQtyPer(bomdata_qtyreq) AS qtyreq,
 <? if exists("useActualCosts") ?>
        formatCost(bomdata_actunitcost) AS f_cost,
        formatCost(bomdata_actextendedcost) AS f_extcost
 <? else ?>
        formatCost(bomdata_stdunitcost) AS f_cost,
        formatCost(bomdata_stdextendedcost) AS f_extcost
 <? endif ?>
   FROM summarizedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>);

 --------------------------------------------------------------------
 REPORT: CountTagEditList
 QUERY: detail
 SELECT formatBoolYN(invcnt_priority) AS f_priority,
        CASE WHEN (invcnt_tagnumber IS NULL) THEN 'Misc.'
             ELSE invcnt_tagnumber
        END AS f_tagnumber,
        formatDate(invcnt_tagdate) AS f_tagdate,
        item_number,
        item_descrip1,
        item_descrip2,
        warehous_code,
        CASE WHEN (invcnt_location_id IS NOT NULL)
                  THEN (SELECT formatQty(SUM(itemloc_qty))
                          FROM itemloc
                         WHERE ((itemloc_itemsite_id=itemsite_id)
                           AND  (itemloc_location_id=invcnt_location_id)) )
             ELSE formatQty(itemsite_qtyonhand)
        END AS f_qoh,
        CASE WHEN (location_id IS NOT NULL)
                  THEN location_name
             ELSE 'All' END AS location_name,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after)
        END AS f_cntqty,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after - itemsite_qtyonhand)
        END AS f_variance,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
-            WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after > 0)) THEN formatScrap(1)
-            WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after < 0)) THEN formatScrap(-1)
-            WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after = 0)) THEN formatScrap(0)
-            ELSE formatScrap((1 - (invcnt_qoh_after / itemsite_qtyonhand)) * -1)
+            WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after > 0)) THEN formatPrcnt(1)
+            WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after < 0)) THEN formatPrcnt(-1)
+            WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after = 0)) THEN formatPrcnt(0)
+            ELSE formatPrcnt((1 - (invcnt_qoh_after / itemsite_qtyonhand)) * -1)
        END AS f_percent,
        formatExtPrice(stdcost(item_id) * (invcnt_qoh_after - itemsite_qtyonhand)) AS f_amount
   FROM invcnt LEFT OUTER JOIN location ON (invcnt_location_id=location_id),
        item, warehous, itemsite
  WHERE ((invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (NOT invcnt_posted)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN ( SELECT classcode_id
                                  FROM classcode
                                 WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN ( SELECT plancode_id
                                  FROM plancode
                                 WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
 )
 ORDER BY f_priority DESC, item_number
 <? if exists("maxTags") ?>
     LIMIT <? value("maxTags") ?>
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: CreditMemo
 QUERY: GroupHead
 SELECT remitto.*,
        cmhead_number,
        formatDate(cmhead_docdate) AS docdate,
        cust_number,
        cust_name,
        formatAddr(cmhead_billtoaddress1, cmhead_billtoaddress2, cmhead_billtoaddress3,
                   COALESCE(cmhead_billtocity,'') || '  ' || COALESCE(cmhead_billtostate,'') || '  ' || COALESCE(cmhead_billtozip,''),
                    cmhead_billtocountry)
        AS f_custaddr,
        cust_phone,
        cmhead_shipto_name,
        formatAddr(cmhead_shipto_address1, cmhead_shipto_address2, cmhead_shipto_address3,
                   COALESCE(cmhead_shipto_city,'') ||'  '|| COALESCE(cmhead_shipto_state,'') || '  '|| COALESCE(cmhead_shipto_zipcode,''),
                   cmhead_shipto_country)
                   AS f_shiptoaddr,
        CASE
          WHEN (cmhead_invcnumber='-1') THEN ''
          --note: must now set explicit type for Postgres 8.3+
          --add ' '
          ELSE text(cmhead_invcnumber)
        END AS invcnumber,
        cmhead_custponumber,
        cmhead_comments,
        cmhead_misc_descrip,
        curr_symbol,
        curr_name
   FROM remitto, cmhead, cust, curr_symbol
  WHERE ((cmhead_cust_id=cust_id)
        AND (cmhead_curr_id = curr_id)
-       AND (cmhead_id=%1))
+       AND (cmhead_id=<? value("cmhead_id") ?>))
 ORDER BY cmhead_number;
 --------------------------------------------------------------------

 QUERY: Detail
 SELECT cmitem_linenumber,
        formatQty(cmitem_qtycredit) AS qtycredit,
        formatQty(cmitem_qtyreturned) AS qtyreturned,
        uom_name,
        item_number,
        item_descrip1,
        item_descrip2,
        formatSalesPrice(cmitem_unitprice) AS unitprice,
        formatMoney((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio)) AS extprice,
        cmitem_comments
   FROM cmitem, itemsite, item, uom
  WHERE ((cmitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
-   AND (cmitem_cmhead_id=%1))
+   AND (cmitem_cmhead_id=<? value("cmhead_id") ?>))
 ORDER BY cmitem_linenumber;
 --------------------------------------------------------------------

 QUERY: GroupFoot
 SELECT formatExtPrice(SUM((cmitem_qtycredit * cmitem_qty_invuomratio) * cmitem_unitprice / cmitem_price_invuomratio)) AS extprice
   FROM cmhead, cmitem, itemsite, item
  WHERE ((cmitem_cmhead_id=cmhead_id)
    AND (cmitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
-   AND (cmhead_id=%1));
+   AND (cmhead_id=<? value("cmhead_id") ?>));
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT formatExtPrice( COALESCE(cmhead_freight,0.0) +
                        ( SELECT COALESCE(SUM(tax * -1.0), 0)
                          FROM ( SELECT ROUND(SUM(taxdetail_tax), 2) AS tax
                                 FROM tax JOIN calculateTaxDetailSummary('CM', cmhead_id, 'T')
                                            ON (taxdetail_tax_id=tax_id)
                                 GROUP BY tax_id ) AS data ) +
                        COALESCE(cmhead_misc,0.0) +
                        ( SELECT COALESCE(SUM((cmitem_qtycredit * cmitem_qty_invuomratio) *
                                               cmitem_unitprice / cmitem_price_invuomratio), 0.0)
                          FROM cmitem
-                         WHERE (cmitem_cmhead_id=%1) )
+                         WHERE (cmitem_cmhead_id=<? value("cmhead_id") ?>) )
                      ) AS totaldue,
        formatExtPrice(COALESCE(cmhead_freight,0.0)) AS freight,
        ( SELECT formatExtPrice(COALESCE(SUM(tax * -1.0), 0))
          FROM ( SELECT ROUND(SUM(taxdetail_tax), 2) AS tax
                 FROM tax JOIN calculateTaxDetailSummary('CM', cmhead_id, 'T')
                            ON (taxdetail_tax_id=tax_id)
                 GROUP BY tax_id ) AS data ) AS tax,
        formatExtPrice(COALESCE(cmhead_misc,0.0)) AS misc
   FROM cmhead
- WHERE (cmhead_id=%1);
+ WHERE (cmhead_id=<? value("cmhead_id") ?>);

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
   FROM gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
        LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id AND gltrans_docnumber='Misc.')
  WHERE ((gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
+<? if exists("docnum") ?>
+   AND (gltrans_docnumber = case when <? value("docnum") ?> = '' then gltrans_docnumber else <? value("docnum") ?> end )
+<? endif ?>
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_created <? if not exists("beginningBalance") ?> DESC <? endif ?>,
         gltrans_sequence, gltrans_amount

 ;

 --------------------------------------------------------------------
 REPORT: IndentedBOM
 QUERY: detail
 SELECT (REPEAT(' ',(bomdata_bomwork_level-1)*3) || bomdata_bomwork_seqnumber) AS f_seqnumber,
        bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
        bomdata_issuemethod AS issuemethod,
        bomdata_createchild AS createchild,
-       formatQtyPer(bomdata_qtyper) AS qtyper,
+       formatQtyPer(bomdata_qtyreq) AS qtyreq,
        formatScrap(bomdata_scrap) AS scrap,
        CASE WHEN COALESCE(bomdata_effective, startOfTime()) <= startOfTime()
             THEN <? value("always") ?>
             ELSE formatDate(bomdata_effective)
        END AS effective,
        CASE WHEN COALESCE(bomdata_expires, endOfTime()) >= endOfTime()
             THEN <? value("never") ?>
             ELSE formatDate(bomdata_expires)
        END AS expires
 FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>)
 WHERE (bomdata_item_id>0);

 --------------------------------------------------------------------
 REPORT: IndentedWhereUsed
 QUERY: detail
 SELECT (REPEAT(' ',(bomwork_level-1)*3) || bomwork_seqnumber) AS f_seqnumber,
        bomworkitemsequence(bomwork_id) AS seqord,
        item_number, uom_name AS item_invuom,
        item_descrip1, item_descrip2,
+       formatQty(bomwork_qtyfxd) AS qtyfxd,
        formatQtyPer(bomwork_qtyper) AS qtyper,
        formatScrap(bomwork_scrap) AS scrap,
        formatDate(bomwork_effective, 'Always') AS effective,
        formatDate(bomwork_expires, 'Never') AS expires
   FROM bomwork, item, uom
  WHERE ((bomwork_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (bomwork_set_id=<? value("bomworkset_id") ?>)
 <? if not exists("showExpired") ?>
    AND (bomwork_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomwork_effective <= CURRENT_DATE)
 <? endif ?>
 )
 ORDER BY seqord;

 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: GroupHead
 SELECT 
 
 --Due Date
-CASE WHEN terms_type = 'D' THEN
-
-	FORMATDATE(DATE(invchead_invcdate + terms_duedays))
-	
-	WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate))<= terms_cutoffday THEN
-
-	FORMATDATE(DATE(
-	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' || 
-	EXTRACT(MONTH FROM(invchead_invcdate)) || '-' || 
-	terms_duedays
-	))
-
-	WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate)) > terms_cutoffday THEN
-
-	FORMATDATE(DATE(
-	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' || 
-	(EXTRACT(MONTH FROM(invchead_invcdate)) +1) || '-' || 
-	terms_duedays
-	))
-	
-	END AS due_date,
---Discount Date-------------------------------------
-
-CASE WHEN terms_type = 'D' THEN
-	FORMATDATE(DATE(invchead_invcdate + terms_discdays))
-
-       WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate))<= terms_cutoffday THEN
-	
-	FORMATDATE(DATE(
-	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' || 
-	EXTRACT(MONTH FROM(invchead_invcdate)) || '-' || 
-	terms_discdays
-	))
-
-	WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate)) > terms_cutoffday THEN
-
-	FORMATDATE(DATE(
-	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' || 
-	(EXTRACT(MONTH FROM(invchead_invcdate)) +1) || '-' || 
-	terms_discdays
-	))
-	END AS dis_date,
-
---Discount Date END --
-
+formatDate(determineDueDate(invchead_terms_id, invchead_invcdate)) AS due_date,
+--Discount Date
+formatDate(determineDiscountDate(invchead_terms_id, invchead_invcdate)) AS dis_date,
 
       --remitto.*,
 remitto_name,
 formatAddr(remitto_address1, remitto_address2, remitto_address3, remitto_citystatezip, remitto_country) AS remitto_adr,
       invchead_invcnumber AS invoicenumber,
       formatDate(invchead_invcdate) AS f_invoicedate,
       cust_number,
       invchead_billto_name,
       formatAddr(invchead_billto_address1, invchead_billto_address2, invchead_billto_address3, ( invchead_billto_city || '  ' || invchead_billto_state || '  ' || invchead_billto_zipcode ), invchead_billto_country) AS f_billtoaddress,
       invchead_billto_phone,
       invchead_shipto_name,
       formatAddr(invchead_shipto_address1, invchead_shipto_address2, invchead_shipto_address3, ( invchead_shipto_city || '  ' || invchead_shipto_state || ' ' || invchead_shipto_zipcode ), invchead_shipto_country) AS f_shiptoaddress,
       invchead_ordernumber AS ordernumber,
       invchead_ponumber,
       formatDate(invchead_orderdate) AS f_orderdate,
       formatDate(invchead_shipdate) AS f_shipdate,
       invchead_fob, terms_descrip, invchead_shipvia
-FROM remitto, cust, invchead
-    LEFT OUTER JOIN terms ON (invchead_terms_id=terms_id)
+FROM remitto, cust, invchead, terms
 WHERE ( (invchead_cust_id=cust_id)
+AND (invchead_terms_id=terms_id)
 AND (invchead_id=<? value("invchead_id") ?>) )
 ORDER BY ordernumber;
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
-                         itemtotal - total_allocated) - (invchead_payment+applied)) AS f_netdue,
+                         itemtotal - total_allocated)) AS f_netdue,
        formatMoney(total_allocated) AS f_allocated
  FROM (SELECT invchead_misc_amount, invchead_freight,
               invchead_payment, invchead_notes, invchead_misc_descrip,
-              (SELECT SUM(tax)
+              (SELECT COALESCE(SUM(tax),0)
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
-              SUM(COALESCE(arapply_applied, 0)) AS applied,
               COALESCE(
               CASE WHEN invchead_posted THEN
                  (SELECT SUM(COALESCE(currToCurr(arapply_curr_id, t.aropen_curr_id,
                                                  arapply_applied, t.aropen_docdate), 0))
                   FROM arapply, aropen s, aropen t
                   WHERE ( (s.aropen_id=arapply_source_aropen_id)
                     AND   (arapply_target_aropen_id=t.aropen_id)
                     AND   (arapply_target_doctype='I')
                     AND   (arapply_target_docnumber=invchead_invcnumber)
+                    AND   (arapply_reftype='S')
                     AND   (arapply_source_aropen_id=s.aropen_id)))
               ELSE
                  (SELECT SUM(COALESCE(CASE WHEN((aropen_amount - aropen_paid) >=
                                                 currToCurr(aropenco_curr_id, aropen_curr_id,
                                                            aropenco_amount, aropen_docdate))
                                            THEN currToCurr(aropenco_curr_id, invchead_curr_id,
                                                            aropenco_amount, aropen_docdate)
                                            ELSE currToCurr(aropen_curr_id, invchead_curr_id,
                                                            aropen_amount - aropen_paid,
                                                            aropen_docdate)
                                       END, 0))
                    FROM aropenco, aropen, cohead
                   WHERE ( (aropenco_aropen_id=aropen_id)
                     AND   (aropenco_cohead_id=cohead_id)
                     AND   ((aropen_amount - aropen_paid) > 0)
                     AND   (cohead_number=invchead_ordernumber)))
               END, 0) AS total_allocated
        FROM invchead
             LEFT OUTER JOIN invcitem ON (invcitem_invchead_id=invchead_id)
-            LEFT OUTER JOIN arapply ON (arapply_target_docnumber=invchead_invcnumber AND arapply_source_doctype='K')
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
       CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN currToCurr(aropenco_curr_id, aropen_curr_id,
 			    aropenco_amount, aropen_docdate)
            ELSE (aropen_amount - aropen_paid)
       END AS allocated,
       CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN formatMoney(currToCurr(aropenco_curr_id, aropen_curr_id,
 					aropenco_amount, aropen_docdate))
            ELSE formatMoney(aropen_amount - aropen_paid)
       END AS f_allocated,
       CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN currToCurr(aropenco_curr_id, invchead_curr_id,
 			    aropenco_amount, aropen_docdate)
            ELSE currToCurr(aropen_curr_id, invchead_curr_id,
                            aropen_amount - aropen_paid, aropen_docdate)
       END AS allocated_invccurr,
       CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN formatMoney(currToCurr(aropenco_curr_id, invchead_curr_id,
 					aropenco_amount, aropen_docdate))
            ELSE formatMoney(currToCurr(aropen_curr_id, invchead_curr_id,
                                        aropen_amount - aropen_paid,
                                        aropen_docdate))
       END AS f_allocated_invccurr,
       curr_symbol AS aropen_currsymbol
  FROM aropenco, aropen, cohead, invchead, curr_symbol
 WHERE ( (aropenco_aropen_id=aropen_id)
   AND   (aropenco_cohead_id=cohead_id)
   AND   ((aropen_amount - aropen_paid) > 0)
   AND   (aropen_curr_id=curr_id)
   AND   (cohead_number=invchead_ordernumber)
   AND   (NOT invchead_posted)
   AND   (invchead_id=<? value("invchead_id") ?>) )
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
+  AND   (arapply_reftype='S')
   AND   (cohead_number=invchead_ordernumber)
   AND   (invchead_posted)
   AND   (invchead_id=<? value("invchead_id") ?>) )
 ORDER BY aropen_docnumber;

 --------------------------------------------------------------------
 REPORT: ItemsByCharacteristic
 QUERY: detail
 SELECT item_number,
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
+            WHEN (item_type='L') THEN 'Planning'
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
        char_name, charass_value
   FROM item, charass, char, uom AS iuom, uom AS puom
  WHERE ((charass_target_type='I')
    AND (charass_target_id=item_id)
    AND (item_inv_uom_id=iuom.uom_id)
    AND (item_price_uom_id=puom.uom_id)
    AND (charass_char_id=char_id)
    AND (char_id=<? value("char_id") ?>)
    AND (charass_value ~* <? value("value") ?>)
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: ItemsByClassCode
 QUERY: detail
 SELECT item_number,
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
+            WHEN (item_type='L') THEN 'Planning'
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
   FROM item, classcode, uom AS iuom, uom AS puom
  WHERE ((item_classcode_id=classcode_id)
    AND (item_inv_uom_id=iuom.uom_id)
    AND (item_price_uom_id=puom.uom_id)
 <? if exists("classcode_id") ?>
    AND (classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (classcode_code ~ <? value("classcode_pattern") ?>)
 <? endif ?>
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: ItemsByProductCategory
 QUERY: detail
 SELECT item_number,
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
+            WHEN (item_type='L') THEN 'Planning'
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
        prodcat_code
   FROM item, prodcat, uom AS iuom, uom AS puom
  WHERE ((item_prodcat_id=prodcat_id)
    AND (item_inv_uom_id=iuom.uom_id)
    AND (item_price_uom_id=puom.uom_id)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByBOMItem
 QUERY: head
 SELECT parent.item_number AS parent_number,
        parent.item_descrip1 AS parent_descrip1,
        parent.item_descrip2 AS parent_descrip2,
        puom.uom_name AS parent_invuom,
        child.item_number AS comp_number,
        child.item_descrip1 AS comp_descrip1,
        child.item_descrip2 AS comp_descrip2,
        cuom.uom_name AS comp_invuom,
        bomitem_seqnumber as comp_seqnumber,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item as parent, item as child, uom AS puom, uom AS cuom, bomitem
  WHERE ((parent.item_id=<? value("item_id") ?>)
    AND (parent.item_inv_uom_id=puom.uom_id)
    AND (bomitem_item_id=child.item_id)
    AND (child.item_inv_uom_id=cuom.uom_id)
-   AND (bomitem_id=<? value("component_item_id") ?>) );
+   AND (bomitem_id=<? value("bomitem_id") ?>) );

 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
        CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
             WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
             ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
        END AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss, (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS component,
                 itemsite AS parent
           WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
             AND (womatlvar_component_itemsite_id=component.itemsite_id)
-            AND (womatlvar_bomitem_id=<? value("component_item_id") ?>)
+            AND (womatlvar_bomitem_id=<? value("bomitem_id") ?>)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (component.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByComponentItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
- WHERE (item_id=<? value("item_id") ?>);
+ WHERE (item_id=<? value("component_item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
-SELECT formatDate(posted) AS f_posted,
-       item_number, item_descrip1, item_descrip2, uom_name,
-       formatQty(ordered) AS f_ordered,
-       formatQty(received) AS f_produced,
-       formatQty(projreq) AS f_projreq,
-       formatQtyPer(projqtyper) AS f_projqtyper,
-       formatQty(actiss) AS f_actiss,
-       formatQtyPer(actqtyper) AS f_actqtyper,
-       formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
-            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
-            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
-       END AS f_percent
-  FROM ( SELECT womatlvar_posted AS posted,
-                item_number, uom_name,
-                item_descrip1, item_descrip2,
-                womatlvar_qtyord AS ordered,
-                womatlvar_qtyrcv AS received,
-                (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
-                womatlvar_qtyper AS projqtyper,
-                (womatlvar_qtyiss) AS actiss,
-                (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
-           FROM womatlvar, itemsite AS component,
-                itemsite AS parent, item, uom
-          WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
-            AND (womatlvar_component_itemsite_id=component.itemsite_id)
-            AND (parent.itemsite_item_id=item_id)
-            AND (item_inv_uom_id=uom_id)
-            AND (component.itemsite_item_id=<? value("item_id") ?>)
-            AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-            AND (component.itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-                )
-       ) AS data
-ORDER BY posted;
+== MetaSQL statement workOrderVariance-material

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByItem
 QUERY: detail
-SELECT formatDate(posted) AS f_posted,
-       item_number, item_descrip1, item_descrip2, uom_name,
-       formatQty(ordered) AS f_ordered,
-       formatQty(received) AS f_produced,
-       formatQty(projreq) AS f_projreq,
-       formatQtyPer(projqtyper) AS f_projqtyper,
-       formatQty(actiss) AS f_actiss,
-       formatQtyPer(actqtyper) AS f_actqtyper,
-       formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
-            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
-            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
-       END AS f_percent
-  FROM ( SELECT womatlvar_posted AS posted,
-                item_number, uom_name,
-                item_descrip1, item_descrip2,
-                womatlvar_qtyord AS ordered,
-                womatlvar_qtyrcv AS received,
-                (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
-                womatlvar_qtyper AS projqtyper,
-                (womatlvar_qtyiss) AS actiss,
-                (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
-           FROM womatlvar, itemsite AS component,
-                itemsite AS parent, item, uom
-          WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
-            AND (womatlvar_component_itemsite_id=component.itemsite_id)
-            AND (component.itemsite_item_id=item_id)
-            AND (item_inv_uom_id=uom_id)
-            AND (parent.itemsite_item_id=<? value("item_id") ?>)
-            AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-            AND (parent.itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-                )
-       ) AS data
-ORDER BY posted;
+== MetaSQL statement workOrderVariance-material

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWarehouse
 QUERY: detail
-SELECT formatDate(posted) AS f_posted,
-       parent_number, parent_descrip1, parent_descrip2, parent_invuom,
-       child_number, child_descrip1, child_descrip2, child_invuom,
-       formatQty(ordered) AS f_ordered,
-       formatQty(received) AS f_produced,
-       formatQty(projreq) AS f_projreq,
-       formatQtyPer(projqtyper) AS f_projqtyper,
-       formatQty(actiss) AS f_actiss,
-       formatQtyPer(actqtyper) AS f_actqtyper,
-       formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
-            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
-            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
-       END AS f_percent
-  FROM ( SELECT womatlvar_posted AS posted,
-                parentitem.item_number AS parent_number,
-                puom.uom_name AS parent_invuom,
-                parentitem.item_descrip1 AS parent_descrip1,
-                parentitem.item_descrip2 AS parent_descrip2,
-                componentitem.item_number AS child_number,
-                cuom.uom_name AS child_invuom,
-                componentitem.item_descrip1 AS child_descrip1,
-                componentitem.item_descrip2 AS child_descrip2,
-                womatlvar_qtyord AS ordered,
-                womatlvar_qtyrcv AS received,
-                (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
-                womatlvar_qtyper AS projqtyper,
-                (womatlvar_qtyiss) AS actiss,
-                (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
-           FROM womatlvar, itemsite AS componentsite, itemsite AS parentsite,
-                item AS componentitem, item AS parentitem, uom AS puom, uom AS cuom
-          WHERE ((womatlvar_parent_itemsite_id=parentsite.itemsite_id)
-            AND (womatlvar_component_itemsite_id=componentsite.itemsite_id)
-            AND (parentsite.itemsite_item_id=parentitem.item_id)
-            AND (parentitem.item_inv_uom_id=puom.uom_id)
-            AND (componentsite.itemsite_item_id=componentitem.item_id)
-            AND (componentitem.item_inv_uom_id=cuom.uom_id)
-            AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-            AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-                )
-       ) AS data
-ORDER BY posted;
+== MetaSQL statement workOrderVariance-material

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWorkOrder
 QUERY: detail
-SELECT formatDate(posted) AS f_posted,
-       item_number, item_descrip1, item_descrip2, uom_name,
-       formatQty(ordered) AS f_ordered,
-       formatQty(received) AS f_produced,
-       formatQty(projreq) AS f_projreq,
-       formatQtyPer(projqtyper) AS f_projqtyper,
-       formatQty(actiss) AS f_actiss,
-       formatQtyPer(actqtyper) AS f_actqtyper,
-       formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
-            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
-            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
-       END AS f_percent
-  FROM ( SELECT womatlvar_posted AS posted,
-                item_number, uom_name,
-                item_descrip1, item_descrip2,
-                womatlvar_qtyord AS ordered,
-                womatlvar_qtyrcv AS received,
-                (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
-                womatlvar_qtyper AS projqtyper,
-                (womatlvar_qtyiss) AS actiss,
-                (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
-           FROM womatlvar, itemsite, item, wo, uom
-          WHERE ((womatlvar_component_itemsite_id=itemsite_id)
-            AND (itemsite_item_id=item_id)
-            AND (item_inv_uom_id=uom_id)
-            AND (wo_number=womatlvar_number)
-            AND (wo_subnumber=womatlvar_subnumber)
-            AND (wo_id=<? value("wo_id") ?>) ) ) AS data
-ORDER BY item_number;
+== MetaSQL statement workOrderVariance-material

 --------------------------------------------------------------------
 REPORT: OrderActivityByProject
 QUERY: detail
 <? if exists("showSo") ?>
 SELECT quhead_id AS id,
        10 AS typeid,
        text('Section 1 - Pro Forma Revenue (Quotes)') AS section,
        text('Quote') AS type,
        text(quhead_number) || '-' || text(quitem_linenumber) AS ordernumber,
        CASE WHEN quhead_origin = 'C'  THEN 'Customer'
             WHEN quhead_origin = 'S'  THEN 'Sales Rep'
             WHEN quhead_origin = 'I'  THEN 'Internet'
        END AS status,
        item_number AS item,
        formatQty(quitem_qtyord) AS f_qty,
        formatQty(quitem_qtyord * quitem_price) AS f_value,
        quitem_qtyord * quitem_price AS amt_value,
        quitem_qtyord * quitem_price AS amt_report
   FROM quhead, quitem, itemsite, item
  WHERE ((quhead_prj_id = <? value("prj_id") ?>)
         AND (quitem_quhead_id = quhead_id)
         AND (quitem_itemsite_id = itemsite_id)
         AND (itemsite_item_id = item_id))

 UNION

 SELECT
        cohead_id AS id,
        20 AS typeid,
        text('Section 2 - Booked Revenue') AS section,
        text('Sales Order - See Invoice Section for Closed Line Amounts') AS type,
        text(cohead_number) || '-' || text(coitem_linenumber) AS ordernumber,
        CASE WHEN cohead_holdtype = 'N'  THEN 'Not On Hold'
             WHEN cohead_holdtype = 'C'  THEN 'On Credit Hold'
             WHEN cohead_holdtype = 'S'  THEN 'On Shipping Hold'
             WHEN cohead_holdtype = 'P'  THEN 'On Packing Hold'
             WHEN cohead_holdtype = 'R'  THEN 'On Return Hold'
        END AS status,
        item_number AS item,

        formatQty(coitem_qtyord) AS f_qty,
        CASE WHEN coitem_status = 'C' THEN 'SO Line Closed - See Invoice'
             WHEN coitem_status <> 'C' THEN formatQty((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio))
        END AS f_value,

        CASE WHEN coitem_status = 'C' THEN 0
             WHEN coitem_status <> 'C' THEN (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio)
        END AS amt_value,

        CASE WHEN coitem_status = 'C' THEN 0
             WHEN coitem_status <> 'C' THEN (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio)
        END AS amt_report

   FROM cohead, coitem, itemsite, item
  WHERE ((cohead_prj_id = <? value("prj_id"?>)
         AND (coitem_cohead_id = cohead_id)
         AND (coitem_itemsite_id = itemsite_id)
         AND (itemsite_item_id = item_id))

 UNION

 SELECT invchead_id AS id,
        40 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Closed Sales Order Lines') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        CASE WHEN invcitem_id <> '-1'  THEN item_number
              WHEN invcitem_id = '-1'  THEN invcitem_number
        END AS item,
        formatQty(invcitem_ordered) AS f_qty,
        formatQty((invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
        (invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
        (invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem, item
   WHERE ((invchead_prj_id= <? value("prj_id") ?> )
         AND (invcitem_invchead_id = invchead_id)
         AND (invcitem_item_id = item_id)
         AND (invchead_ordernumber in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id AND coitem_status = 'C')))

 UNION

 SELECT invchead_id AS id,
        45 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Open Sales Order Lines') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        CASE WHEN invcitem_id <> '-1'  THEN item_number
              WHEN invcitem_id = '-1'  THEN invcitem_number
        END AS item,
        formatQty(invcitem_ordered) AS f_qty,
        text('SO Line Open - See Sales Order') AS f_value,
        0 AS amt_value,
        0 AS amt_report

   FROM invchead, invcitem, item
   WHERE ((invchead_prj_id= <? value("prj_id") ?> )
         AND (invcitem_invchead_id = invchead_id)
         AND (invcitem_item_id = item_id)
         AND (invchead_ordernumber in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id AND coitem_status <> 'C')))

 UNION

 SELECT invchead_id AS id,
        50 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Misc., No SO Number - User Defined Item') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        invcitem_number AS item,
        formatQty(invcitem_billed) AS f_qty,
        formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem
   WHERE ((invchead_prj_id= <? value("prj_id") ?>)
         AND (invcitem_invchead_id = invchead_id)
         AND (invchead_ordernumber is null))


 UNION

 SELECT invchead_id AS id,
        52 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Misc., User SO Number - User Defined Item ') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        invcitem_number AS item,
        formatQty(invcitem_billed) AS f_qty,
        formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem
   WHERE ((invchead_prj_id= <? value("prj_id") ?>)
         AND (invcitem_invchead_id = invchead_id)
         AND (invchead_ordernumber is not null)
         AND (invcitem_item_id = -1))

 UNION

 SELECT invchead_id AS id,
        56 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Misc., User SO Number - Normal Item') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        CASE WHEN invcitem_id <> '-1'  THEN item_number
              WHEN invcitem_id = '-1'  THEN invcitem_number
        END AS item,
        formatQty(invcitem_billed) AS f_qty,
        formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem, item
   WHERE ((invchead_prj_id= <? value("prj_id") ?> )
         AND (invcitem_invchead_id = invchead_id)
         AND (invcitem_item_id = item_id)
         AND (invchead_ordernumber not in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id)
         AND (invchead_ordernumber is not null)))


 <? endif ?>


 <? if exists("showWo") ?>

 <?   if exists("showSo") ?>

 UNION

 <?   endif ?>

 SELECT wo_id AS id,
        90 AS typeid,
        text('Section 6 - Work Order Expense') AS section,
        text('Work Orders') AS type,
        formatWoNumber(wo_id) AS ordernumber,
        wo_status AS status,
        item_number AS item,
        formatQty(wo_qtyord) AS f_qty,

        CASE WHEN wo_status <> 'I'  THEN formatQty(wo_postedvalue)
             WHEN wo_status  = 'I' THEN formatQty(wo_wipvalue)
        END AS f_value,

        CASE WHEN wo_status <> 'I'  THEN wo_postedvalue
             WHEN wo_status  = 'I' THEN wo_wipvalue
        END AS amt_value,

        CASE WHEN wo_status <> 'I'  THEN wo_postedvalue * -1
             WHEN wo_status  = 'I' THEN wo_wipvalue * -1
        END AS amt_report

   FROM wo, itemsite, item
  WHERE ((wo_prj_id=<? value("prj_id") ?>)
        AND (wo_itemsite_id = itemsite_id)
        AND (itemsite_item_id = item_id))
 <? endif ?>


 <? if exists("showPo") ?>
 <?   if exists("showSo") ?>
  UNION
 <? elseif exists("showWo") ?>
  UNION

 <? endif ?>

 SELECT pr_id AS id,
        60 AS typeid,
        text('Section 4 - Pro Forma Expense (Purchase Requests)') AS section,
        text('Purchase Requests - Values At Standard') AS type,
        text(pr_number) AS ordernumber,
        pr_status AS status,
        item_number AS item,
        formatQty(pr_qtyreq) AS f_qty,
        formatQty(stdcost(item_id) * pr_qtyreq) AS f_value,
        stdcost(item_id) * pr_qtyreq AS amt_value,
        stdcost(item_id) * pr_qtyreq * -1 AS amt_report
   FROM pr, item, itemsite
  WHERE ((pr_prj_id=<? value("prj_id") ?>)
        AND (pr_itemsite_id = itemsite_id)
        AND (itemsite_item_id = item_id)
        AND (pr_itemsite_id = itemsite_id)
        AND (itemsite_item_id = item_id))

 UNION

 SELECT poitem_id AS id,
        70 AS typeid,
        text('Section 5 - Purchase Expense') AS section,
        text('Purchase Order - Stocked Items') AS type,
        (text(pohead_number) || '-' || text(poitem_linenumber)) AS ordernumber,
        poitem_status AS status,

        item_number AS item,

        formatQty(poitem_qty_ordered) AS f_qty,
        formatQty(poitem_qty_ordered * poitem_unitprice) AS f_value,
        poitem_qty_ordered * poitem_unitprice AS amt_value,
        poitem_qty_ordered * poitem_unitprice * -1 AS amt_report
   FROM pohead, poitem, itemsite, item
  WHERE ((poitem_pohead_id = pohead_id)
    AND  (poitem_prj_id = <? value("prj_id") ?>)
    AND  (poitem_itemsite_id = itemsite_id)
    AND  (itemsite_item_id = item_id))

 UNION

 SELECT poitem_id AS id,
        80 AS typeid,
        text('Section 5 - Purchase Expense') AS section,
-       text('Purcahse Order - Inventory Items') AS type,
+       text('Purchase Order - Inventory Items') AS type,
        (text(pohead_number) || '-' || text(poitem_linenumber)) AS ordernumber,
        poitem_status AS status,

        poitem_vend_item_number AS item,

        formatQty(poitem_qty_ordered) AS f_qty,
        formatQty(poitem_qty_ordered * poitem_unitprice) AS f_value,
        poitem_qty_ordered * poitem_unitprice AS amt_value,
        poitem_qty_ordered * poitem_unitprice * -1 AS amt_report

   FROM pohead, poitem
  WHERE ((poitem_pohead_id = pohead_id)
    AND  (poitem_prj_id = <? value("prj_id") ?>)
-   AND  (poitem_itemsite_id = '-1'))
+   AND  (poitem_itemsite_id is null))

 <? endif ?>

 ORDER BY section, typeid, ordernumber;

 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: so_ra_relation
 --added in 2.3 to show RA link to S/O if the SO
 --was created as the result of a replacement RA
+<? if exists("EnableReturnAuth") ?>
 select
 'RA #' AS ratext,
 rahead_number
 from
 rahead, cohead, shiphead
 where
 rahead_new_cohead_id = cohead_id
 and cohead_id = shiphead_order_id
 and shiphead_id = <? value("shiphead_id") ?>;
+<? else ?>
+select
+'' AS ratext,
+'' AS rahead_number
+<? endif ?>

 --------------------------------------------------------------------
 REPORT: PendingBOMChanges
 QUERY: detail
 SELECT formatDate(bomitem_effective) as actiondate,
        'Effective' AS action,
        bomitem_seqnumber, item_number, uom_name,
        item_descrip1, item_descrip2, uom_name,
+       formatQty(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyfxd)) AS qtyfxd,
        formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper + (1 * bomitem_scrap))) AS qtyreq,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, (bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap))) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod
   FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item, uom
  WHERE ((bomitem_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (bomitem_effective BETWEEN CURRENT_DATE AND <? value("cutOffDate") ?>)
 )
 UNION
 SELECT formatDate(bomitem_expires) as actiondate,
        'Expires' AS action,
        bomitem_seqnumber, item_number, uom_name,
        item_descrip1, item_descrip2, uom_name,
+       formatQty(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyfxd)) AS qtyfxd,
        formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
        formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper + (1 * bomitem_scrap))) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod
 FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item, uom
 WHERE ((bomitem_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (bomitem_expires BETWEEN CURRENT_DATE AND <? value("cutOffDate") ?>)
 )
 ORDER BY action, actiondate, bomitem_seqnumber;

 --------------------------------------------------------------------
 REPORT: PendingWOMaterialAvailability
 QUERY: detail
 SELECT bomitem_seqnumber, item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(pendalloc) AS pendalloc,
        formatQty(totalalloc + pendalloc) AS totalalloc,
        formatQty(qoh) AS qoh,
        formatQty(qoh + ordered - (totalalloc + pendalloc)) AS totalavail
 FROM ( SELECT bomitem_seqnumber, item_number,
               item_descrip1, item_descrip2, uom_name,
-              ((itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper * (1 + bomitem_scrap))) * <? value("buildQty") ?>) AS pendalloc,
+              ((itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, (bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap))) * <? value("buildQty") ?>) AS pendalloc,
               qtyAllocated(itemsite_id, date(<? value("buildDate") ?>)) AS totalalloc,
               noNeg(itemsite_qtyonhand) AS qoh,
               qtyOrdered(itemsite_id, date(<? value("buildDate") ?>)) AS ordered
    FROM itemsite, item, bomitem(<? value("item_id") ?>), uom
        WHERE ((bomitem_item_id=itemsite_item_id)
         AND (itemsite_item_id=item_id)
         AND (item_inv_uom_id=uom_id)
         AND (itemsite_warehous_id=<? value("warehous_id") ?>)
         AND (<? value("effectiveDate") ?> BETWEEN bomitem_effective AND (bomitem_expires-1)) ) ) AS data
 <? if exists("showShortages") ?>
 WHERE ((qoh + ordered - (totalalloc + pendalloc)) < 0.0)
 <? endif ?>
 ORDER BY bomitem_seqnumber;

 --------------------------------------------------------------------
 REPORT: PurchaseOrder
 QUERY: Head
 SELECT pohead_number,
        formatDate(pohead_orderdate) AS f_orderdate,
        pohead_fob,
        pohead_shipvia,
        terms_descrip,
        vend_number,
        vend_name,
        vend_address1,
        vend_address2,
        vend_address3,
        (vend_city || '  '  || vend_state || '  ' || vend_zip) AS vendcitystatezip,
        formataddr(vend_address1, vend_address2, vend_address3, (vend_city || '  '  || vend_state || '   ' || vend_zip), vend_country) as vend_address,
        warehous_descrip,
        addr_line1 as warehous_addr1,
        addr_line2 as warehous_addr2,
        addr_line3 as warehous_addr3,
        addr_city  as warehous_addr4,
        addr_postalcode as zip,
        addr_state,
        addr_country,
        formataddr(addr_line1, addr_line2, addr_line3, (addr_city || ' ' || addr_state || ' ' || addr_postalcode), addr_country) as warehouse_address,
-       pohead_agent_username AS username,
+       pohead_agent_username,
+       usr.usr_propername AS username,
        pohead_comments,
        text(<? value("title") ?>) AS title
  FROM pohead
+   LEFT OUTER JOIN usr ON (pohead.pohead_agent_username = usr.usr_username)
    LEFT OUTER JOIN terms ON (pohead_terms_id = terms_id),
    vend, whsinfo
    LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
  WHERE ((pohead_vend_id=vend_id)
    AND (pohead_warehous_id = warehous_id)
    AND (pohead_id=<? value("pohead_id") ?>) );
 --------------------------------------------------------------------

 QUERY: ShipToAddress
 SELECT pohead_number,
-
-CASE WHEN pohead_vendaddr_id IS NULL THEN
-     warehous_descrip
-ELSE
-     vendaddr_name
-END
-AS warehous_name,
-
-CASE WHEN pohead_vendaddr_id IS NULL THEN
-formataddr(addr_line1, addr_line2, addr_line3, (addr_city || ' ' || addr_state || ' ' || addr_postalcode), addr_country)
-ELSE
-formataddr(vendaddr_address1, vendaddr_address2, vendaddr_address3, (vendaddr_city || ' ' || vendaddr_state || ' ' || vendaddr_zipcode), vendaddr_country)
-END
-AS warehous_address
-
-FROM
-pohead
-LEFT OUTER JOIN vendaddr ON (pohead_vendaddr_id = vendaddr_id),
-vend,
-whsinfo
-LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
-WHERE ((pohead_vend_id=vend_id) AND
-       (pohead_warehous_id = warehous_id) AND
-        (pohead_id=<? value("pohead_id") ?>)
-);
+       formatDate(pohead_orderdate) AS f_orderdate,
+       pohead_fob,
+       pohead_shipvia,
+       terms_descrip,
+       vend_number,
+       vend_name,
+       vend_address1,
+       vend_address2,
+       vend_address3,
+       (vend_city || '  '  || vend_state || '  ' || vend_zip) AS vendcitystatezip,
+       formatcntctname(pohead_vend_cntct_id) AS vend_contact,
+       formataddr(pohead_vendaddress1, pohead_vendaddress2, pohead_vendaddress3, (pohead_vendcity || '  '  || pohead_vendstate || '   ' || pohead_vendzipcode), pohead_vendcountry) as vend_address,
+       warehous_descrip,
+       addr_line1 as warehous_addr1,
+       addr_line2 as warehous_addr2,
+       addr_line3 as warehous_addr3,
+       addr_city  as warehous_addr4,
+       addr_postalcode as zip,
+       addr_state,
+       addr_country,
+       formatcntctname(pohead_shipto_cntct_id) AS shipto_contact,
+       formataddr(pohead_shiptoaddress1, pohead_shiptoaddress2, pohead_shiptoaddress3, (pohead_shiptocity || ' ' || pohead_shiptostate || ' ' || pohead_shiptozipcode), pohead_shiptocountry) as shipto_address,
+       pohead_agent_username AS username,
+       pohead_comments,
+       text(<? value("title") ?>) AS title
+ FROM pohead
+   LEFT OUTER JOIN terms ON (pohead_terms_id = terms_id),
+   vend, whsinfo
+   LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
+ WHERE ((pohead_vend_id=vend_id)
+   AND (pohead_warehous_id = warehous_id)
+   AND (pohead_id=<? value("pohead_id") ?>) );

 --------------------------------------------------------------------
 REPORT: PurchaseReqsByPlannerCode
 QUERY: detail
 SELECT pr_number || '-' || pr_subnumber AS pr_number,
        item_number,
        (item_descrip1 || ' ' || item_descrip2) as item_descrip,
        pr_status,
        CASE WHEN (pr_order_type='W') THEN ('W/O ' || ( SELECT formatWoNumber(womatl_wo_id)
                                                          FROM womatl
                                                         WHERE (womatl_id=pr_order_id) ) )
             WHEN (pr_order_type='S') THEN ('S/O ' || (SELECT formatSoNumber(pr_order_id)))
             WHEN (pr_order_type='F') THEN ('Planned Order')
             WHEN (pr_order_type='M') THEN 'Manual'
             ELSE 'Other'
        END AS f_type,
+       formatdatetime(pr_createdate) AS f_createdate,
        formatDate(pr_duedate) AS f_duedate,
-       formatQty(pr_qtyreq) AS f_qtyreq
+       formatQty(pr_qtyreq) AS f_qtyreq,
+       pr_releasenote as f_notes
   FROM pr, itemsite, item
  WHERE ((pr_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (pr_duedate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id
                                    FROM plancode
                                   WHERE (plancode_code ~ <? value("plancode_pattern") ?>) ) )
 <? endif ?>
 )
 ORDER BY pr_duedate;

 --------------------------------------------------------------------
 REPORT: PurchaseRequestsByItem
 QUERY: detail
 SELECT pr_status,
        pr_number || '-' || pr_subnumber AS pr_number,
        CASE WHEN (pr_order_type='W') THEN ('W/O ' || ( SELECT formatWoNumber(womatl_wo_id)
                                                        FROM womatl
                                                        WHERE (womatl_id=pr_order_id) ) )
             WHEN (pr_order_type='S') THEN ('S/O ' || (SELECT formatSoNumber(pr_order_id)))
             WHEN (pr_order_type='F') THEN ('Planned Order')
             WHEN (pr_order_type='M') THEN 'Manual'
             ELSE 'Other'
        END as f_type,
+       pr_createdate as f_createdate,
        formatDate(pr_duedate) as f_duedate,
-       formatQty(pr_qtyreq) as f_qtyreq
+       formatQty(pr_qtyreq) as f_qtyreq,
+        pr_releasenote as f_notes
   FROM pr, itemsite
  WHERE ((pr_itemsite_id=itemsite_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 ORDER BY pr_duedate;

 --------------------------------------------------------------------
 REPORT: QOHByParameterList
 QUERY: head
-SELECT <? if exists("warehous_id") ?>
+SELECT <? if exists("classcode") ?>
+         text('Quantities on Hand by Class Code')
+       <? elseif exists("classcode_id") ?>
+         text('Quantities on Hand by Class Code')
+       <? elseif exists("classcode_pattern") ?>
+         text('Quantities on Hand by Class Code')
+       <? elseif exists("itemgrp") ?>
+         text('Quantities on Hand by Item Group')
+       <? elseif exists("itemgrp_id") ?>
+         text('Quantities on Hand by Item Group')
+       <? elseif exists("itemgrp_pattern") ?>
+         text('Quantities on Hand by Item Group')
+       <? else ?>
+         text('')
+       <? endif ?>
+       AS title,
+       <? if exists("warehous_id") ?>
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
          text('')
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
 REPORT: SelectPaymentsList
 QUERY: detail
 SELECT apopen_id, apselectid, vendor, apopen_docnumber, apopen_ponumber,
               formatDate(apopen_duedate) AS f_duedate,
               formatDate(apopen_docdate) AS f_docdate,
               formatMoney(amount) AS f_amount,
-              f_selected, f_late
+              f_selected, f_late, status
  FROM (SELECT apopen_id, COALESCE(apselect_id, -1) AS apselectid,
        (vend_number || '-' || vend_name) AS vendor,
        apopen_docnumber, apopen_ponumber,
        apopen_duedate, apopen_docdate,
        (apopen_amount - apopen_paid -
                    COALESCE((SELECT SUM(checkitem_amount / checkitem_curr_rate)
                              FROM checkitem, checkhead
                              WHERE ((checkitem_checkhead_id=checkhead_id)
                               AND (checkitem_apopen_id=apopen_id)
                               AND (NOT checkhead_void)
                               AND (NOT checkhead_posted))
                            ), 0)) AS amount,
        formatMoney(COALESCE(SUM(apselect_amount), 0)) AS f_selected,
-       formatBoolYN(apopen_duedate <= CURRENT_DATE) AS f_late
+       formatBoolYN(apopen_duedate <= CURRENT_DATE) AS f_late,
+       CASE WHEN (apopen_status='O') THEN TEXT('Open')
+                    ELSE CASE WHEN (apopen_status='H') THEN TEXT('On Hold')
+                      ELSE CASE WHEN (apopen_status='C') THEN TEXT('Close')
+                      END
+                    END
+                  END AS status
   FROM vend, apopen LEFT OUTER JOIN apselect ON (apselect_apopen_id=apopen_id)
  WHERE ( (apopen_open)
    AND (apopen_doctype IN ('V', 'D'))
    AND (apopen_vend_id=vend_id)
 <? if exists("vend_id") ?>
    AND (vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
    AND (vend_vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
    AND (vend_vendtype_id IN (SELECT vendtype_id
                                FROM vendtype
                               WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
 <? endif ?>
        )
 GROUP BY apopen_id, apselect_id, vend_number, vend_name,
          apopen_docnumber, apopen_ponumber,
-         apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id) AS data
+         apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_status) AS data
  WHERE (amount <> 0.0)
 ORDER BY apopen_duedate, amount DESC;

 --------------------------------------------------------------------
 REPORT: SingleLevelBOM
 QUERY: detail
 SELECT bomitem_seqnumber, item_number,
        invuom.uom_name AS invuomname, issueuom.uom_name AS issueuomname,
        item_descrip1, item_descrip2,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod,
+       formatQty(bomitem_qtyfxd) AS issueqtyfxd,
+       formatQty(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyfxd)) AS invqtyfxd,
        formatQtyPer(bomitem_qtyper) AS issueqtyper,
        formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS invqtyper,
        formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(bomitem_qtyper * (1 + bomitem_scrap)) AS qtyreq,
+       formatQtyPer((bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap)) AS qtyreq,
        formatDate(bomitem_effective, <? value("always") ?>) AS effective,
        formatDate(bomitem_expires, <? value("never") ?>) AS expires,
        bomitem_ecn
 <? if exists("revision_id") ?>
   FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>)
 <? else ?>
   FROM bomitem(<? value("item_id") ?>)
 <? endif ?>
 , item, uom AS issueuom, uom AS invuom
 WHERE ((bomitem_item_id=item_id)
 AND (item_inv_uom_id=invuom.uom_id)
 AND (bomitem_uom_id=issueuom.uom_id)
 <? if exists("expiredDays") ?>
  AND (bomitem_expires > (CURRENT_DATE - <? value("expiredDays") ?>))
 <? else ?>
  AND (bomitem_expires > CURRENT_DATE)
 <? endif ?>

 <? if exists("effectiveDays") ?>
  AND (bomitem_effective <= (CURRENT_DATE + <? value("effectiveDays") ?>))
 <? else ?>
  AND (bomitem_effective <= CURRENT_DATE)
 <? endif ?>

 )
 ORDER BY bomitem_seqnumber, bomitem_effective;

 --------------------------------------------------------------------
 REPORT: SingleLevelWhereUsed
 QUERY: detail
 SELECT bomitem_seqnumber, item_number,
        item_descrip1, item_descrip2, uom_name,
+       formatQty(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyfxd)) AS f_qtyfxd,
        formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS f_qtyper,
        formatScrap(bomitem_scrap) AS f_scrap,
        formatDate(bomitem_effective, 'Always') AS f_effective,
        formatDate(bomitem_expires, 'Never') AS f_expires,
        formatBoolYN(bomitem_createwo) AS f_createwo,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
-            WHEN (bomitem_issuemethod='M') THEN 'Mixxed'
+            WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS f_issuemethod,
-       formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper + (1 * bomitem_scrap))) as f_qtyreq
+       formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, (bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap))) as f_qtyreq
   FROM bomitem, item, uom
  WHERE ((bomitem_parent_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (bomitem_item_id=<? value("item_id") ?>)
 <? if exists("effective") ?>
    AND (<? value("effective") ?> BETWEEN bomitem_effective and (bomitem_expires-1))
 <? else ?>
    AND (CURRENT_DATE BETWEEN bomitem_effective and (bomitem_expires-1))
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: SummarizedBOM
 QUERY: detail
 select bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
-       formatQtyPer(bomdata_qtyper) AS qtyper
+       formatQtyPer(bomdata_qtyreq) AS qtyreq
   FROM summarizedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>)

 --------------------------------------------------------------------
 REPORT: TimePhasedOpenARItems
 QUERY: head
 SELECT <? if exists("cust_id") ?>
          ( SELECT cust_name
              FROM cust
             WHERE (cust_id=<? value("cust_id") ?>) )
        <? elseif exists("custtype_id") ?>
          ( SELECT (custtype_code || '-' || custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
+      <? elseif exists("custgrp_id") ?>
+         ( SELECT (custgrp_name || '-' ||  custgrp_descrip)
+	   FROM custgrp
+            WHERE (custgrp_id=<? value("custgrp_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customers')
        <? endif ?>
        AS f_value,
        <? if reExists("custtype_.*") ?>
          text('Customer Type:')
+       <? elseif exists("custgrp_id") ?>
+         text('Customer Group:')
        <? else ?>
          text('Customer:')
        <? endif ?>
        AS f_label;

 --------------------------------------------------------------------

 QUERY: detail
 SELECT pstart, pend,
        period,
        cust_number, cust_name,
        value,
        formatMoney(value) AS f_value
   FROM (
   SELECT calitem_start AS pstart,
          calitem_end AS pend,
          (formatDate(calitem_start) || '-' || formatDate(calitem_end)) AS period,
          cust_number,
          cust_name,
          openARItemsValue(cust_id, calitem_id) AS value
-    FROM cust,
+    FROM cust LEFT OUTER JOIN custgrpitem ON (cust_id=custgrpitem_cust_id)
+         LEFT OUTER JOIN custgrp ON (custgrpitem_custgrp_id=custgrp_id),
          ( SELECT rcalitem_id AS calitem_id,
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
   <? if exists("cust_id") ?>
    WHERE (cust_id=<? value("cust_id") ?>)
   <? elseif exists("custtype_id") ?>
    WHERE (cust_custtype_id=<? value("custtype_id") ?>)
+  <? elseif exists("custgrp_id") ?>
+   WHERE (custgrp_id=<? value("custgrp_id") ?>)
   <? elseif exists("custtype_pattern") ?>
    WHERE (cust_custtype_id IN (SELECT custtype_id
                                  FROM custtype
                                 WHERE (custtype_code ~ <? value("custtype_pattern") ?>) ))
   <? endif ?>
   ) AS data
  WHERE (value != 0)
 ORDER BY pstart, pend, cust_number

 --------------------------------------------------------------------
 REPORT: UninvoicedShipments
 QUERY: detail
 SELECT cohead_id, coship_id, cohead_number, coitem_linenumber,
        item_number, item_descrip1, item_descrip2,
        uom_name,
-       formatQty(SUM(coship_qty)) AS f_shipped,
-       formatQty(COALESCE(SUM(cobill_qty), 0)) AS f_selected
+       shipped, formatQty(shipped) AS f_shipped,
+       selected, formatQty(selected) AS f_selected
+FROM (
+SELECT cohead_id, coship_id, cohead_number, coitem_linenumber,
+       item_number, item_descrip1, item_descrip2,
+       uom_name,
+       COALESCE(SUM(coship_qty), 0) AS shipped,
+       COALESCE(SUM(cobill_qty), 0) AS selected
 FROM cohead, itemsite, item, uom,
      warehous, coship, cosmisc,
      coitem LEFT OUTER JOIN
       ( cobill JOIN cobmisc
         ON ( (cobill_cobmisc_id=cobmisc_id) AND (NOT cobmisc_posted) ) )
      ON (cobill_coitem_id=coitem_id)
 WHERE ( (coship_coitem_id=coitem_id)
  AND (coship_cosmisc_id=cosmisc_id)
  AND (coitem_cohead_id=cohead_id)
  AND (coitem_itemsite_id=itemsite_id)
  AND (coitem_qty_uom_id=uom_id)
  AND (itemsite_item_id=item_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (cosmisc_shipped)
  AND (NOT coship_invoiced)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 GROUP BY cohead_number, coitem_id, coitem_linenumber, item_number,
-         item_descrip1, item_descrip2, cohead_id, coship_id, uom_name;
+         item_descrip1, item_descrip2, cohead_id, coship_id, uom_name
+) AS data
+<? if exists("showUnselected") ?>
+ WHERE (selected = 0)
+<? endif ?>
+;

 --------------------------------------------------------------------
 REPORT: ValidLocationsByItem
 QUERY: detail
 SELECT warehous_code,
        formatLocationName(location_id) AS locationname,
        firstLine(location_descrip) as f_descrip,
-       text('No') AS restricted,
-       CASE WHEN (location_netable) THEN text('Yes')
-            ELSE text('No')
-       END AS netable
+       formatBoolYN(location_restrict) AS restricted,
+       formatBoolYN(location_netable) AS netable
   FROM itemsite, location, warehous
- WHERE ((itemsite_warehous_id=location_warehous_id)
+ WHERE ((validLocation(location_id, itemsite_id))
+   AND  ((itemsite_loccntrl) OR (itemsite_location_id=location_id))
    AND (itemsite_item_id=<? value("item_id") ?>)
-   AND (location_warehous_id=warehous_id)
-   AND (NOT location_restrict)
-<? if exists("warehous_id") ?>
-   AND (warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-)
-UNION
-SELECT warehous_code,
-       formatLocationName(location_id) AS locationname,
-       firstLine(location_descrip) as f_descrip,
-       text('Yes') AS restricted,
-       CASE WHEN (location_netable) THEN text('Yes')
-            ELSE text('No')
-       END AS netable
-  FROM location, warehous, locitem
- WHERE ((locitem_location_id=location_id)
-   AND (location_warehous_id=warehous_id)
-   AND (location_restrict)
-   AND (locitem_item_id=<? value("item_id") ?>)
+   AND  (itemsite_warehous_id=warehous_id)
 <? if exists("warehous_id") ?>
    AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
+
 ORDER BY warehous_code, locationname;

 --------------------------------------------------------------------
 REPORT: WOMaterialAvailabilityByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code as warehouse,
        item_number, item_descrip1, item_descrip2, uom_name,
        wo_status AS status,
        <? if exists("onlyShowShortages") ?>
          text('Only Show Shortages')
        <? elseif exists("onlyShowInsufficientInventory") ?>
          text('Only Show Insufficient Inventory')
        <? else ?>
          text('None')
        <? endif ?>
-       AS filtertext
+       AS itemfiltertext,
+       <? if exists("IndentedParentChild") ?>
+         text('Indented Works Orders')
+       <? elseif exists("summarizedParentChild") ?>
+         text('Summarized Parent/Child Orders')
+       <? else ?>
+         text('Parent Order Only')
+       <? endif ?>
+       AS wofiltertext
   FROM wo, itemsite, item, uom, warehous
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );
 --------------------------------------------------------------------

 QUERY: detail
-SELECT item_number, item_descrip1, item_descrip2, uom_name,
-               formatQty(qoh) AS adjqoh,
-               formatQty(wobalance) AS woalloc,
-               formatQty(allocated) AS totalalloc,
-               formatQty(ordered) AS ordered,
-               formatQty(qoh + ordered - wobalance) AS woavail,
-               formatQty(qoh + ordered - allocated) AS totalavail
-   FROM (SELECT item_number, item_descrip1, item_descrip2,
-                uom_name,
-                noNeg(itemsite_qtyonhand) AS qoh,
-                noNeg(womatl_qtyreq - womatl_qtyiss) AS wobalance,
-                qtyAllocated(itemsite_id, womatl_duedate) AS allocated,
-                qtyOrdered(itemsite_id, womatl_duedate) AS ordered
-           FROM wo, womatl, itemsite, item, uom
-          WHERE ((womatl_wo_id=wo_id)
-             AND (womatl_itemsite_id=itemsite_id)
-             AND (itemsite_item_id=item_id)
-             AND (womatl_uom_id=uom_id)
-             AND (womatl_wo_id=<? value("wo_id") ?>))
-        ) AS data
+SELECT *, (REPEAT(' ',(woinvav_level-1)*3) || woinvav_item_wo_number) AS itemwonumber FROM woinvavail(<? value("wo_id") ?>,
+<? if exists("IndentedParentChild") ?>
+true,
+ <? else ?>
+false,
+<? endif ?>
+<? if exists("summarizedParentChild") ?>
+true,
+ <? else ?>
+false,
+<? endif ?>
 <? if exists("onlyShowShortages") ?>
- WHERE ( ((qoh + ordered - allocated) < 0) OR ((qoh + ordered - wobalance) < 0) )
+true,
+ <? else ?>
+false,
 <? endif ?>
 <? if exists("onlyShowInsufficientInventory") ?>
-   WHERE ( ((qoh - allocated) < 0)OR ((qoh - wobalance) < 0) )
+true)
+ <? else ?>
+false)
 <? endif ?>
-ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByComponentItem
 QUERY: detail
 SELECT formatWONumber(wo_id) AS wonumber,
                item_number, item_descrip1, item_descrip2,
                CASE WHEN (womatl_issuemethod='S') THEN 'Push'
                          WHEN (womatl_issuemethod='L') THEN 'Pull'
                          WHEN (womatl_issuemethod='M') THEN 'Mixed'
                          ELSE 'Error'
                 END AS issuemethod,
                 uom_name,
+                formatQty(womatl_qtyfxd) AS qtyfxd,
                 formatQty(womatl_qtyper) AS qtyper,
                 formatScrap(womatl_scrap) AS scrappercent,
                 formatQty(womatl_qtyreq) AS required,
                 formatQty(womatl_qtyiss) AS issued,
                 formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS balance,
                 formatDate(womatl_duedate) AS duedate
     FROM wo, womatl, itemsite AS parentsite, itemsite AS componentsite, item, uom
 WHERE ((womatl_wo_id=wo_id)
        AND (womatl_uom_id=uom_id)
        AND (wo_status <> 'C')
        AND (wo_itemsite_id=parentsite.itemsite_id)
        AND (womatl_itemsite_id=componentsite.itemsite_id)
        AND (parentsite.itemsite_item_id=item_id)
        AND (componentsite.itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
        AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 ORDER BY wo_startdate;
 --------------------------------------------------------------------

+QUERY: total
+SELECT formatQty(SUM(womatl_qtyreq)) AS required,
+       formatQty(SUM(womatl_qtyiss)) AS issued,
+       formatQty(SUM(noNeg(womatl_qtyreq - womatl_qtyiss))) AS balance
+    FROM wo, womatl, itemsite AS parentsite, itemsite AS componentsite, item, uom
+WHERE ((womatl_wo_id=wo_id)
+       AND (womatl_uom_id=uom_id)
+       AND (wo_status <> 'C')
+       AND (wo_itemsite_id=parentsite.itemsite_id)
+       AND (womatl_itemsite_id=componentsite.itemsite_id)
+       AND (parentsite.itemsite_item_id=item_id)
+       AND (componentsite.itemsite_item_id=<? value("item_id") ?>)
+<? if exists("warehous_id") ?>
+       AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
+<? endif ?>
+ )
+;
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByWorkOrder
 QUERY: detail
 SELECT womatl_id, item_number,
        item_descrip1, item_descrip2,
        CASE WHEN (womatl_issuemethod = 'S') THEN 'Push'
             WHEN (womatl_issuemethod = 'L') THEN 'Pull'
             WHEN (womatl_issuemethod = 'M') THEN 'Mixed'
             ELSE 'Error'
        END AS issuemethod,
        uom_name,
+       formatQty(womatl_qtyfxd) AS qtyfxd,
        formatQtyper(womatl_qtyper) AS qtyper,
        formatScrap(womatl_scrap) AS scrappercent,
        formatQty(womatl_qtyreq) AS required,
        formatQty(womatl_qtyiss) AS issued,
        formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS balance,
        formatDate(womatl_duedate) AS duedate
 FROM wo, womatl, itemsite, item, uom
 WHERE ((womatl_wo_id=wo_id)
  AND (womatl_uom_id=uom_id)
  AND (womatl_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
  AND (wo_id=<? value("wo_id") ?>) )
 ORDER BY item_number;

 --------------------------------------------------------------------