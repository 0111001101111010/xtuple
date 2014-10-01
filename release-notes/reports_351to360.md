--------------------------------------------------------------------
NEW REPORTS:
Journals
--------------------------------------------------------------------
CHANGED REPORTS:
ARAging
AROpenItem
AROpenItems
BankAccountsMasterList
BillingEditList
CCReceipt
CRMAccountMasterList
CustomerARHistory
DeliveryDateVariancesByItem
DeliveryDateVariancesByVendor
FinancialReport
FinancialReportMonth
FinancialReportMonthBudget
FinancialReportMonthDbCr
FinancialReportMonthPriorMonth
FinancialReportMonthPriorQuarter
FinancialReportMonthPriorYear
FinancialReportMonthQuarter
FinancialReportMonthYear
FinancialReportQuarter
FinancialReportQuarterBudget
FinancialReportQuarterPriorQuarter
FinancialReportYear
FinancialReportYearBudget
FinancialReportYearPriorYear
FinancialTrend
GLSeries
GLTransactions
InventoryHistory
Invoice
InvoiceInformation
JobCosting
OrderActivityByProject
POLineItemsByVendor
POsByVendor
PackingList
PendingWOMaterialAvailability
PickingListSOLocsNoClosedLines
PricesByCustomer
PricesByCustomerType
PurchaseOrder
QOHByLocation
QOHByParameterList
ReceiptsReturnsByDate
ReceiptsReturnsByItem
ReceiptsReturnsByVendor
StandardJournalHistory
Statement
SummarizedGLTransactions
TaxAuthoritiesMasterList
TimePhasedSalesHistoryByCustomerByItem
UnpostedGLTransactions
VendorMasterList
WOMaterialAvailabilityByWorkOrder


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
-      LEFT OUTER JOIN custgrpitem ON (araging_cust_id=custgrpitem_cust_id)
 <? if exists("cust_id") ?>
    WHERE (araging_cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    WHERE (araging_cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
-WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
+   LEFT OUTER JOIN custgrpitem ON (araging_cust_id=custgrpitem_cust_id)
+   WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    WHERE (araging_custtype_code ~ <? value("custtype_pattern") ?>)
 <? endif ?>;


 --------------------------------------------------------------------
 REPORT: AROpenItem
 QUERY: applications
 <? if exists("docTypeID") ?>
 SELECT arapply_id, arapply_source_aropen_id,
-CASE WHEN (arapply_source_doctype = 'C') THEN 'Credit Memo'
-     WHEN (arapply_source_doctype = 'R') THEN 'Cash Deposit'
-     WHEN (arapply_fundstype='C') THEN 'Check'
-     WHEN (arapply_fundstype='T') THEN 'Certified Check'
-     WHEN (arapply_fundstype='M') THEN 'Master Card'
-     WHEN (arapply_fundstype='V') THEN 'Visa'
-     WHEN (arapply_fundstype='A') THEN 'American Express'
-     WHEN (arapply_fundstype='D') THEN 'Discover Card'
-     WHEN (arapply_fundstype='R') THEN 'Other Credit Card'
-     WHEN (arapply_fundstype='K') THEN 'Cash'
-     WHEN (arapply_fundstype='W') THEN 'Wire Transfer'
-     WHEN (arapply_fundstype='O') THEN 'Other'
+     CASE WHEN (arapply_source_doctype = 'C') THEN <? value("creditMemo") ?>
+       WHEN (arapply_source_doctype = 'R') THEN <? value("cashdeposit") ?>
+       WHEN (arapply_fundstype='C') THEN <? value("check") ?>
+       WHEN (arapply_fundstype='T') THEN <? value("certifiedCheck") ?>
+       WHEN (arapply_fundstype='M') THEN <? value("masterCard") ?>
+       WHEN (arapply_fundstype='V') THEN <? value("visa") ?>
+       WHEN (arapply_fundstype='A') THEN <? value("americanExpress") ?>
+       WHEN (arapply_fundstype='D') THEN <? value("discoverCard") ?>
+       WHEN (arapply_fundstype='R') THEN <? value("otherCreditCard") ?>
+       WHEN (arapply_fundstype='K') THEN <? value("cash") ?>
+       WHEN (arapply_fundstype='W') THEN <? value("wireTransfer") ?>
+       WHEN (arapply_fundstype='O') THEN <? value("other") ?>
      END AS doctype,
      CASE WHEN (arapply_source_doctype IN ('C','R')) THEN arapply_source_docnumber
      WHEN (arapply_source_doctype = 'K') THEN arapply_refnumber
      ELSE 'Other'
      END AS docnumber,
 arapply_postdate, arapply_applied,
 currConcat(arapply_curr_id) AS currabbr,
 currToBase(arapply_curr_id, arapply_applied, arapply_postdate) AS baseapplied,
 'curr' AS arapply_applied_xtnumericrole,
 'curr' AS baseapplied_xtnumericrole
 FROM arapply
 WHERE (arapply_target_aropen_id=<? value("aropen_id") ?> )
 ORDER BY arapply_postdate

 <? elseif exists("docTypeRC") ?>

 SELECT arapply_id, arapply_target_aropen_id,
-CASE WHEN (arapply_target_doctype = 'I') THEN 'Invoice'
-     WHEN (arapply_target_doctype = 'D') THEN 'Debit Memo'
-     WHEN (arapply_target_doctype = 'K') THEN 'A/P Check'
-     ELSE 'Other'
+     CASE WHEN (arapply_target_doctype = 'I') THEN <? value("invoice") ?>
+      WHEN (arapply_target_doctype = 'D') THEN <? value("debitMemo") ?>
+      WHEN (arapply_target_doctype = 'K') THEN <? value("apcheck") ?>
+      WHEN (arapply_target_doctype = 'R') THEN <? value("cashreceipt") ?>
+      ELSE <? value("other") ?>
      END AS doctype,
 arapply_target_docnumber AS docnumber,
 arapply_postdate, arapply_applied,
 currConcat(arapply_curr_id) AS currabbr,
 currToBase(arapply_curr_id, arapply_applied, arapply_postdate) AS baseapplied,
 'curr' AS arapply_applied_xtnumericrole,
 'curr' AS baseapplied_xtnumericrole
 FROM arapply
 WHERE (arapply_source_aropen_id=<? value("aropen_id") ?> )
 ORDER BY arapply_postdate

 <? endif ?>


 --------------------------------------------------------------------
 REPORT: AROpenItems
 QUERY: detail
-== MetaSQL statement arOpenItems-detail
+== MetaSQL statement arOpenItems-f_detail


 --------------------------------------------------------------------
 REPORT: BankAccountsMasterList
 QUERY: detail
 SELECT bankaccnt_id,
        bankaccnt_name AS f_name,
        bankaccnt_descrip AS f_descrip,
        CASE WHEN (bankaccnt_type='K') THEN text('Checking')
             WHEN (bankaccnt_type='C') THEN text('Cash')
+            WHEN (bankaccnt_type='R') THEN text('Credit Card')
             ELSE text('?')
        END AS f_type,
        formatBoolYN(bankaccnt_ap) AS f_ap,
        formatBoolYN(bankaccnt_ar) AS f_ar
   FROM bankaccnt
 ORDER BY bankaccnt_name;


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
 	''		 							AS descrip,
         ''		 							AS f_ordernumber,
 	cohead_number								as ordernumber,
 	-1				 					AS linenumber,
 	''						 			AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(calcCobmiscTax(cobmisc_id))				AS price,
         formatExtPrice(calcCobmiscTax(cobmisc_id))				AS extprice,
 	calcCobmiscTax(cobmisc_id)						AS subextprice,
-	currtobase(cobmisc_tax_curr_id, calcCobmiscTax(cobmisc_id), cobmisc_invcdate) AS runningextprice,
+	currtobase(cobmisc_curr_id, calcCobmiscTax(cobmisc_id), cobmisc_invcdate) AS runningextprice,
        '' AS debit,
        '' AS credit,
-        currConcat(cobmisc_tax_curr_id)     AS currabbr
+        currConcat(cobmisc_curr_id)     AS currabbr
 FROM cobmisc, cohead
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (NOT cobmisc_posted)
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
 REPORT: CCReceipt
 QUERY: detail
 SELECT *,
        formatbytea(decrypt(setbytea(ccard_name),
                            setbytea(<? value("key") ?>),
                            'bf')) AS holder,
        formatccnumber(decrypt(setbytea(ccard_number),
                               setbytea(<? value("key") ?>),
                               'bf')) AS xxxx,
        CASE WHEN (ccpay_type='A') THEN <? value("preauth") ?>
             WHEN (ccpay_type='C') THEN <? value("charge") ?>
             WHEN (ccpay_type='R') THEN <? value("refund") ?>
             ELSE ccpay_type
        END AS type,
        CASE WHEN (ccpay_status='A') THEN <? value("authorized") ?>
             WHEN (ccpay_status='C') THEN <? value("approved") ?>
             WHEN (ccpay_status='D') THEN <? value("declined") ?>
+            WHEN (ccpay_status='R') THEN <? value("reversed") ?>
             WHEN (ccpay_status='V') THEN <? value("voided") ?>
             WHEN (ccpay_status='X') THEN <? value("noapproval") ?>
             ELSE ccpay_status
        END AS status

 FROM ccpay JOIN
      ccard ON (ccpay_ccard_id=ccard_id) JOIN
      custinfo ON (ccard_cust_id=cust_id)
 WHERE (ccpay_id=<? value("ccpay_id") ?>);


 --------------------------------------------------------------------
 REPORT: CRMAccountMasterList
 QUERY: detail
-SELECT crmacct_number,
-       crmacct_name,
-       CASE WHEN crmacct_cust_id IS NULL THEN '' ELSE 'Y' END AS f_cust,
-       CASE WHEN crmacct_prospect_id IS NULL THEN '' ELSE 'Y' END AS f_prospect,
-       CASE WHEN crmacct_vend_id IS NULL THEN '' ELSE 'Y' END AS f_vend,
-       CASE WHEN crmacct_competitor_id IS NULL THEN '' ELSE 'Y' END AS f_competitor,
-       CASE WHEN crmacct_partner_id IS NULL THEN '' ELSE 'Y' END AS f_partner,
-       CASE WHEN crmacct_taxauth_id IS NULL THEN '' ELSE 'Y' END AS f_taxauth
-  FROM crmacct
-<? if exists("activeOnly") ?>
- WHERE crmacct_active
-<? endif ?>
-ORDER BY crmacct_number;
+== MetaSQL statement crmaccounts-detail


 --------------------------------------------------------------------
 REPORT: CustomerARHistory
 QUERY: detail
-SELECT aropen_id, -1 AS arapply_id,
-       aropen_docnumber AS sortnumber,
-       aropen_docnumber AS docnumber,
-       formatBoolYN(aropen_open) AS f_open,
-       CASE WHEN (aropen_doctype='I') THEN 'Invoice'
-            WHEN (aropen_doctype='C') THEN 'C/M'
-            WHEN (aropen_doctype='D') THEN 'D/M'
-            WHEN (aropen_doctype='R') THEN 'C/D'
-            ELSE 'Other'
-       END AS documenttype,
-       formatDate(aropen_docdate) AS f_docdate,
-       formatDate(aropen_duedate) AS f_duedate,
-       formatMoney(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS f_amount,
-       formatMoney(currtobase(aropen_curr_id,(aropen_amount - aropen_paid),aropen_docdate)) AS f_balance
-FROM aropen
-WHERE ( (aropen_cust_id=<? value("cust_id") ?>)
- AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
-
-UNION
-SELECT aropen_id, arapply_id,
-       aropen_docnumber AS sortnumber,
-       CASE WHEN (arapply_source_doctype='C') THEN arapply_source_docnumber
-            WHEN (arapply_source_doctype='K') THEN arapply_refnumber
-            ELSE 'Error'
-       END AS docnumber,
-       '' AS f_open,
-       CASE WHEN (arapply_source_doctype='C') THEN 'C/M'
-            WHEN (arapply_fundstype='C') THEN 'Check'
-            WHEN (arapply_fundstype='T') THEN 'Certified Check'
-            WHEN (arapply_fundstype='M') THEN 'Master Card'
-            WHEN (arapply_fundstype='V') THEN 'Visa'
-            WHEN (arapply_fundstype='A') THEN ';American Express'
-            WHEN (arapply_fundstype='D') THEN 'Discover Card'
-            WHEN (arapply_fundstype='R') THEN 'Other Credit Card'
-            WHEN (arapply_fundstype='K') THEN 'Cash'
-            WHEN (arapply_fundstype='W') THEN 'Wire Transfer'
-            WHEN (arapply_fundstype='O') THEN 'Other'
-       END AS documenttype,
-       formatDate(arapply_postdate) AS f_docdate,
-       '' AS f_duedate,
-       formatMoney(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) AS f_amount,
-       '' AS f_balance
-FROM arapply, aropen
-WHERE ( (arapply_target_doctype IN ('I', 'D'))
- AND (arapply_target_doctype=aropen_doctype)
- AND (arapply_target_docnumber=aropen_docnumber)
- AND (arapply_cust_id=<? value("cust_id") ?>)
- AND (aropen_cust_id=<? value("cust_id") ?>)
- AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
-
-UNION
-SELECT aropen_id, arapply_id,
-       aropen_docnumber AS sortnumber,
-       arapply_target_docnumber AS docnumber,
-       '' AS f_open,
-       CASE WHEN (arapply_target_doctype='I') THEN 'Invoice'
-            WHEN (arapply_target_doctype='D') THEN 'D/M'
-            ELSE 'Other'
-       END AS documenttype,
-       formatDate(arapply_postdate) AS f_docdate,
-       '' AS f_duedate,
-       formatMoney(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) AS f_amount,
-       '' AS f_balance
-FROM arapply, aropen
-WHERE ( (arapply_source_doctype IN ('K', 'C'))
- AND (arapply_source_doctype=aropen_doctype)
- AND (arapply_source_docnumber=aropen_docnumber)
- AND (arapply_cust_id=<? value("cust_id") ?>)
- AND (aropen_cust_id=<? value("cust_id") ?>)
- AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
-
-ORDER BY sortnumber DESC, arapply_id;
+== MetaSQL statement arHistory-detail


 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByItem
 QUERY: detail
-SELECT porecv_id, porecv_ponumber, vend_name,
-       formatDate(porecv_date) as f_date,
-       firstLine(porecv_vend_item_number) as f_itemnum,
-       firstLine(porecv_vend_item_descrip) as f_itemdescrip,
-       formatQty(porecv_qty) as f_qty,
-       formatDate(porecv_duedate) as f_duedate,
-       formatDate(porecv_date) as f_recvdate
+SELECT porecv_ponumber, vend_name,
+       formatDate(COALESCE(porecv_released, porecv_orderdate)) AS orderdate,
+       DATE(porecv_rlsd_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS req_leadtime,
+       DATE(porecv_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS agrd_leadtime, 		       DATE(porecv_date) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS real_leadtime,
+       DATE(porecv_date) - DATE(porecv_rlsd_duedate) AS req_diff,
+       DATE(porecv_date) - DATE(porecv_duedate) AS argd_diff,
+       formatDate(porecv_date) AS receivedate,
+       porecv_date,			
+       firstLine(porecv_vend_item_number) AS  venditemnumber,
+       firstLine(porecv_vend_item_descrip) AS venditemdescrip, formatQty(porecv_qty) as f_qty,
+       porecv_qty, formatDate(porecv_rlsd_duedate) AS release_duedate,
+       formatDate(porecv_duedate) AS argd_duedate
   FROM porecv, vend, itemsite
  WHERE ( (porecv_vend_id=vend_id)
    AND (porecv_itemsite_id=itemsite_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
    AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND (porecv_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
  )
 ORDER BY porecv_date DESC;


 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByVendor
 QUERY: detail
-SELECT porecv_id, porecv_ponumber, vend_name,
-       formatDate(porecv_date) as f_date,
-       firstLine(porecv_vend_item_number) as f_itemnum,
-       firstLine(porecv_vend_item_descrip) as f_itemdescrip,
-       formatQty(porecv_qty) as f_qty,
-       formatDate(porecv_duedate) as f_duedate,
-       formatDate(porecv_date) as f_recvdate
+SELECT porecv_ponumber, vend_name,
+       formatDate(COALESCE(porecv_released, porecv_orderdate)) AS orderdate,
+       DATE(porecv_rlsd_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS req_leadtime,
+       DATE(porecv_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS agrd_leadtime, 		
+       DATE(porecv_date) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS real_leadtime,
+       DATE(porecv_date) - DATE(porecv_rlsd_duedate) AS req_diff,
+       DATE(porecv_date) - DATE(porecv_duedate) AS argd_diff,
+       firstLine(porecv_item_number) AS  itemnumber,
+       formatDate(porecv_date) AS receivedate,
+       porecv_date,			
+       firstLine(porecv_vend_item_number) AS  venditemnumber,
+       firstLine(porecv_vend_item_descrip) AS venditemdescrip, formatQty(porecv_qty) as f_qty,
+       porecv_qty, formatDate(porecv_rlsd_duedate) AS release_duedate,
+       formatDate(porecv_duedate) AS argd_duedate
   FROM porecv, vend, itemsite
  WHERE ( (porecv_vend_id=vend_id)
    AND (porecv_itemsite_id=itemsite_id)
    AND (vend_id=<? value("vend_id") ?>)
    AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
+   AND (porecv_itemsite_id in (SELECT itemsite_id FROM itemsite WHERE (itemsite_warehous_id=<? value("warehous_id") ?>)))
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND (porecv_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
  )
-ORDER BY porecv_date DESC;
+ORDER BY porecv_date DESC, itemnumber ASC, venditemnumber ASC;


 --------------------------------------------------------------------
 REPORT: FinancialReport
 QUERY: detail
-SELECT financialReport(<? value("flhead_id") ?>, period_id,<? value("interval") ?>)
+SELECT financialReport(<? value("flhead_id") ?>, period_id,<? value("interval") ?>,<? value("prj_id") ?>)
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
    AND  (flrpt_username=CURRENT_USER)
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
    AND  (flrpt_username=CURRENT_USER)
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
    AND  (flrpt_username=CURRENT_USER)
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
    AND  (flrpt_username=CURRENT_USER)
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
 REPORT: FinancialReportMonth
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
+-- Group: financialReport
+-- Name:  detail
+-- Notes:
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR  (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthBudget
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR (flstmtitem_monthbudget <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthDbCr
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_monthdb <> 0) OR (flstmtitem_monthcr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorMonth
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_typedescrip2 || ' Diff.' AS f_diff,
     flstmthead_typedescrip2 || ' % Diff.' AS f_diffprcnt,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR (flstmtitem_prmonth <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorQuarter
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_typedescrip2 || 'Diff.' AS f_diff,
     flstmthead_typedescrip2 || ' % Diff.' AS f_diffprcnt,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR (flstmtitem_prqtr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorYear
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_typedescrip2 || ' Diff.' AS f_diff,
     flstmthead_typedescrip2 || ' % Diff.' AS f_diffprcnt,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR (flstmtitem_pryear <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthQuarter
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR (flstmtitem_qtr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthYear
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_month <> 0) OR (flstmtitem_year <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportQuarter
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_qtr <> 0) OR  (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportQuarterBudget
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_qtr <> 0) OR (flstmtitem_qtrbudget <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportQuarterPriorQuarter
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_typedescrip2 || ' Diff.' AS f_diff,
     flstmthead_typedescrip2 || ' % Diff.' AS f_diffprcnt,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_qtr <> 0) OR (flstmtitem_prqtr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportYear
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_year <> 0) OR  (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportYearBudget
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_year <> 0) OR (flstmtitem_yearbudget <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportYearPriorYear
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     flstmthead_username,
     flstmthead_flhead_name || ' - ' || flstmthead_flcol_name AS f_name,
     flstmthead_typedescrip1,
     flstmthead_typedescrip2,
     flstmthead_typedescrip2 || 'Diff.' AS f_diff,
     flstmthead_typedescrip2 || ' % Diff.' AS f_diffprcnt,
     flstmthead_month,
     flstmthead_qtr,
     flstmthead_year,
     flstmthead_prmonth,
     flstmthead_prqtr,
     flstmthead_pryear
 FROM getflstmthead(<? value("flcol_id") ?>,<? value("period_id") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
     formatMoney(flstmtitem_month) AS flstmtitem_month,
     formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
     formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
     formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
     formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
     formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
     formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
     formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
     formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
     formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
     formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
     formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
     formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
     formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
     formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
     formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
     formatMoney(flstmtitem_year) AS flstmtitem_year,
     formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
     formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
     formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
     formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
     formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
     formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
     formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
     formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
     formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
     formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
     formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
     formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
     formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
     formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
     formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
     formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
     formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
     formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
     formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-,True)
+,True,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((flstmtitem_year <> 0) OR (flstmtitem_pryear <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialTrend
 QUERY: head
 SELECT
+    <? value("project") ?> AS project,
+    (SELECT prj_name FROM prj WHERE prj_id=<? value("prj_id") ?>) AS prj_name,
     fltrendhead_username,
     fltrendhead_flhead_name,
     fltrendhead_typedescrip,
     fltrendhead_fld1,
     fltrendhead_fld2,
     fltrendhead_fld3,
     fltrendhead_fld4,
     fltrendhead_fld5,
     fltrendhead_fld6,
     fltrendhead_fld7,
     fltrendhead_fld8,
     fltrendhead_fld9,
     fltrendhead_fld10,
     fltrendhead_fld11,
     fltrendhead_fld12,
     fltrendhead_grndttl
 FROM getfltrendhead(<? value("flhead_id") ?>,ARRAY[
    <? foreach("period_id_list") ?>
      <? if not isfirst("period_id_list") ?>
       ,
      <? endif ?>
     <? value("period_id_list") ?>
    <? endforeach ?>
 ],<? value("interval") ?>)
 --------------------------------------------------------------------

 QUERY: detail
 SELECT
     fltrenditem_flhead_id,
     fltrenditem_username,
     fltrenditem_order,
     fltrenditem_level,
     fltrenditem_subgrp,
     fltrenditem_type,
     fltrenditem_type_id,
     fltrenditem_parent_id,
     fltrenditem_accnt_id,
     fltrenditem_name,
     fltrenditem_fld1,
     fltrenditem_fld2,
     fltrenditem_fld3,
     fltrenditem_fld4,
     fltrenditem_fld5,
     fltrenditem_fld6,
     fltrenditem_fld7,
     fltrenditem_fld8,
     fltrenditem_fld9,
     fltrenditem_fld10,
     fltrenditem_fld11,
     fltrenditem_fld12,
     fltrenditem_grndttl
 FROM
    financialReport(<? value("flhead_id") ?>, ARRAY[
    <? foreach("period_id_list") ?>
      <? if not isfirst("period_id_list") ?>
       ,
      <? endif ?>
     <? value("period_id_list") ?>
    <? endforeach ?>
 ],<? value("interval") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
-)
+,<? value("prj_id") ?>)
 <? if not exists("showzeros") ?>
   WHERE ((fltrenditem_fld1 <> formatMoney(0) AND fltrenditem_fld1 IS NOT NULL)
 	OR (fltrenditem_fld1 <> formatMoney(0) AND fltrenditem_fld1 IS NOT NULL)
 	OR (fltrenditem_fld2 <> formatMoney(0) AND fltrenditem_fld2 IS NOT NULL)
 	OR (fltrenditem_fld3 <> formatMoney(0) AND fltrenditem_fld3 IS NOT NULL)
 	OR (fltrenditem_fld4 <> formatMoney(0) AND fltrenditem_fld4 IS NOT NULL)
 	OR (fltrenditem_fld5 <> formatMoney(0) AND fltrenditem_fld5 IS NOT NULL)
 	OR (fltrenditem_fld6 <> formatMoney(0) AND fltrenditem_fld6 IS NOT NULL)
 	OR (fltrenditem_fld7 <> formatMoney(0) AND fltrenditem_fld7 IS NOT NULL)
 	OR (fltrenditem_fld8 <> formatMoney(0) AND fltrenditem_fld8 IS NOT NULL)
 	OR (fltrenditem_fld9 <> formatMoney(0) AND fltrenditem_fld9 IS NOT NULL)
 	OR (fltrenditem_fld10 <> formatMoney(0) AND fltrenditem_fld10 IS NOT NULL)
 	OR (fltrenditem_fld11 <> formatMoney(0) AND fltrenditem_fld11 IS NOT NULL)
 	OR (fltrenditem_fld12 <> formatMoney(0) AND fltrenditem_fld12 IS NOT NULL)
 	OR (fltrenditem_type <> 'I'))
 <? endif ?>


 --------------------------------------------------------------------
 REPORT: GLSeries
 QUERY: head
-SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
+SELECT <? value("title") ?> AS title,
+       formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("source") ?>
          text(<? value("source") ?>)
        <? else ?>
          text('All Sources')
        <? endif  ?>
        AS source,
        <? if exists("startJrnlnum") ?>
          text('Start Journal Number:')
        <? else ?>
          text('')
        <? endif ?>
        AS startJrnlnumLit,
        <? if exists("endJrnlnum") ?>
          text('End Journal Number:')
        <? else ?>
          text('')
        <? endif ?>
        AS endJrnlnumLit;
 --------------------------------------------------------------------

 QUERY: detail
+<? if exists("gltrans") ?>
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
+   AND (NOT gltrans_deleted)
    AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
 <? if exists("startJrnlnum") ?>
    AND (gltrans_journalnumber BETWEEN <? value("startJrnlnum") ?> AND <? value("endJrnlnum") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_date, gltrans_sequence, gltrans_amount DESC;
+<? else ?>
+SELECT sltrans_id AS gltrans_id,
+       sltrans_sequence AS gltrans_sequence,
+       formatDate(sltrans_date) AS transdate,
+       sltrans_journalnumber AS gltrans_journalnumber,
+       sltrans_source AS gltrans_source,
+       sltrans_doctype AS gltrans_doctype,
+       sltrans_docnumber AS gltrans_docnumber,
+       (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
+       firstLine(sltrans_notes) AS f_notes,
+       CASE WHEN (sltrans_amount < 0) THEN formatMoney(sltrans_amount * -1)
+            ELSE ''
+       END AS f_debit,
+       CASE WHEN (sltrans_amount > 0) THEN formatMoney(sltrans_amount)
+            ELSE ''
+       END AS f_credit,
+       formatBoolYN(sltrans_posted) AS f_posted
+  FROM sltrans, accnt
+ WHERE ((sltrans_accnt_id=accnt_id)
+   AND (sltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+<? if exists("source") ?>
+   AND (sltrans_source=<? value("source") ?>)
+<? endif ?>
+<? if exists("startJrnlnum") ?>
+   AND (sltrans_journalnumber BETWEEN <? value("startJrnlnum") ?> AND <? value("endJrnlnum") ?>)
+<? endif ?>
+       )
+ORDER BY sltrans_date, sltrans_sequence, sltrans_amount DESC;
+<? endif ?>


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
-       CASE WHEN (gltrans_amount < 0) THEN ABS(gltrans_amount)
+       CASE WHEN (gltrans_amount < 0 AND NOT gltrans_deleted) THEN ABS(gltrans_amount)
             ELSE 0
        END AS debit_amt,
 --Credits:
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
-       CASE WHEN (gltrans_amount > 0) THEN gltrans_amount
+       CASE WHEN (gltrans_amount > 0 AND NOT gltrans_deleted) THEN gltrans_amount
             ELSE 0
        END AS credit_amt,
 --Balance:
-       gltrans_amount * -1 as balance_amt,
---
+       CASE WHEN (NOT gltrans_deleted) THEN
+         gltrans_amount * -1
+       ELSE 0 END AS balance_amt,
        gltrans_amount,
-       CASE WHEN accnt_type IN ('A','E') THEN
+       CASE WHEN (accnt_type IN ('A','E') AND NOT gltrans_deleted) THEN
          gltrans_amount * -1
-       ELSE gltrans_amount END AS running,
+       WHEN (NOT gltrans_deleted) THEN
+         gltrans_amount
+       ELSE 0 END AS running,
        formatBoolYN(gltrans_posted) AS f_posted,
+       formatBoolYN(gltrans_deleted) AS f_deleted,
        gltrans_username AS f_username,
        gltrans_sequence
 FROM gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
      LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id
                             AND gltrans_docnumber='Misc.')
 <? if exists("company_id") ?>
      JOIN company ON (accnt_company=company_number)
 <? endif ?>
 <? if exists("prfcntr_id") ?>
      JOIN prftcntr ON (accnt_profit=prftcntr_number)
 <? endif ?>
 <? if exists("subaccnt_id") ?>
      JOIN subaccnt ON (accnt_sub=subaccnt_number)
 <? endif ?>
 <? if exists("subType") ?>
      JOIN subaccnttype ON (subaccnttype_code=accnt_subaccnttype_code)
 <? endif ?>
 WHERE (
 <? if exists("startDate") ?>
   <? if exists("endDate") ?>
        (gltrans_date BETWEEN <? value("startDate") ?>
                          AND <? value("endDate") ?>)
   <? else ?>
        (gltrans_date BETWEEN <? value("startDate") ?>
                          AND endoftime())
   <? endif ?>
 <? else ?>
   <? if exists("endDate") ?>
        (gltrans_date BETWEEN startoftime()
                          AND <? value("endDate") ?>)
   <? else ?>
        (gltrans_date BETWEEN startoftime()
                          AND endoftime())
   <? endif ?>
 <? endif ?>
+<? if not exists("showDeleted") ?>
+   AND (NOT gltrans_deleted)
+<? endif ?>
 <? if exists("company_id") ?>
    AND (company_id=<? value("company_id") ?>)
 <? endif ?>
 <? if exists("prfcntr_id") ?>
    AND (prftcntr_id=<? value("prfcntr_id") ?>)
 <? endif ?>
 <? if exists("accnt_number") ?>
    AND (accnt_number=<? value("accnt_number") ?>)
 <? endif ?>
 <? if exists("subaccnt_id") ?>
    AND (subaccnt_id=<? value("subaccnt_id") ?>)
 <? endif ?>
 <? if exists("subType") ?>
    AND (subaccnttype_id=<? value("subType") ?>)
 <? endif ?>
 <? if exists("accntType") ?>
    AND (accnt_type= <? value("accntType") ?>)
 <? endif ?>
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
 <? if exists("docnum") ?>
    AND (gltrans_docnumber = case when <? value("docnum") ?> = '' then
  gltrans_docnumber else
 <? value("docnum") ?> end )
 <? endif ?>
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_created <? if not exists("beginningBalance") ?> DESC <? endif ?>,
         gltrans_sequence, gltrans_amount

 ;


 --------------------------------------------------------------------
 REPORT: InventoryHistory
 QUERY: detail
 SELECT invhist_id,
        invhist_transdate,
-       formatDateTime(invhist_transdate) AS transdate,
+       formatDateTime(invhist_transdate) AS f_transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(invhist_invqty) AS transqty,
        (invhist_value_after-invhist_value_before) AS transvalue,
        formatMoney(invhist_value_after-invhist_value_before) AS f_transvalue,
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
        CASE WHEN (invhist_costmethod='A') THEN <? value("average") ?>
             WHEN (invhist_costmethod='S') THEN <? value("standard") ?>
             WHEN (invhist_costmethod='J') THEN <? value("job") ?>
             WHEN (invhist_costmethod='N') THEN <? value("none") ?>
             ELSE <? value("unknown") ?>
        END AS costmethod,
        formatMoney(invhist_value_before) AS valbefore,
        formatMoney(invhist_value_after) AS valafter,
        invhist_user AS username,
        invhist_posted,
        0 AS invdetail_id,
        '' AS locationname,
        '' AS detailqty,
        '' AS locationqtybefore,
        '' AS locationqtyafter,
        CASE WHEN (invhist_transtype='TW') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN whs1.warehous_code
             WHEN (invhist_transtype='IM') THEN whs1.warehous_code
             WHEN (invhist_transtype='IT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN 'WIP'
             WHEN (invhist_transtype='RM') THEN 'WIP'
             WHEN (invhist_transtype='RP') THEN 'PURCH'
             WHEN (invhist_transtype='RR') THEN 'CUST'
             WHEN (invhist_transtype='RS') THEN 'SHIP'
             WHEN (invhist_transtype='SH') THEN whs1.warehous_code
             WHEN (invhist_transtype='SI') THEN whs1.warehous_code
             WHEN (invhist_transtype='SV') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TR') THEN whs2.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs1.warehous_code
             ELSE ''
        END AS locfrom,
        CASE WHEN (invhist_transtype='TW') THEN whs2.warehous_code
             WHEN (invhist_transtype='AD') THEN whs1.warehous_code
             WHEN (invhist_transtype='CC') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN 'WIP'
             WHEN (invhist_transtype='IM') THEN 'WIP'
             WHEN (invhist_transtype='NN') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN whs1.warehous_code
             WHEN (invhist_transtype='RM') THEN whs1.warehous_code
             WHEN (invhist_transtype='RP') THEN whs1.warehous_code
             WHEN (invhist_transtype='RR') THEN whs1.warehous_code
             WHEN (invhist_transtype='RS') THEN whs1.warehous_code
             WHEN (invhist_transtype='RT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RX') THEN whs1.warehous_code
             WHEN (invhist_transtype='SH') THEN 'SHIP'
             WHEN (invhist_transtype='SI') THEN 'SCRAP'
             WHEN (invhist_transtype='SV') THEN 'SHIP'
 	    WHEN (invhist_transtype='TR') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs2.warehous_code
             ELSE ''
        END AS locto
   FROM itemsite, item, warehous AS whs1, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
  WHERE ( (NOT invhist_hasdetail)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=whs1.warehous_id)
-  AND  ((invhist_transdate > DATE <? value("startDate") ?> - 1 AND
-	 invhist_transdate < DATE <? value("endDate") ?> + 1) )
+  AND  (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?> )
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("orderType") ?>
   AND  (invhist_ordtype=<? value("orderType") ?>)
 <? endif ?>
 <? if exists("orderNumber") ?>
   AND  (invhist_ordnumber ~ <? value("orderNumber") ?>)
   AND  (invhist_ordtype = 'SO')
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
+<? if exists("item_id") ?>
+  AND  (itemsite_item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                        AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("itemgrp") ?>
    AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 )
 UNION
 SELECT invhist_id,
        invhist_transdate,
        formatDateTime(invhist_transdate) AS transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(invhist_invqty) AS transqty,
        0 AS transvalue,
        formatMoney(invhist_value_after-invhist_value_before) AS f_transvalue,
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
        CASE WHEN(invhist_costmethod='A') THEN text('Average')
             WHEN(invhist_costmethod='S') THEN text('Standard')
             WHEN(invhist_costmethod='J') THEN text('Job')
             WHEN(invhist_costmethod='N') THEN text('None')
             ELSE 'UNKNOWN'
        END AS costmethod,
        formatMoney(invhist_value_before) AS valbefore,
        formatMoney(invhist_value_after) AS valafter,
        invhist_user AS username,
        invhist_posted,
        invdetail_id,
        CASE WHEN (invdetail_location_id=-1) THEN formatlotserialnumber(invdetail_ls_id)
             WHEN (invdetail_ls_id IS NULL) THEN formatLocationName(invdetail_location_id)
             ELSE (formatLocationName(invdetail_location_id) || '-' || formatlotserialnumber(invdetail_ls_id))
        END AS locationname,
        formatQty(invdetail_qty) AS detailqty,
        formatQty(invdetail_qty_before) AS locationqtybefore,
        formatQty(invdetail_qty_after) AS locationqtyafter,
        CASE WHEN (invhist_transtype='TW') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN whs1.warehous_code
             WHEN (invhist_transtype='IM') THEN whs1.warehous_code
             WHEN (invhist_transtype='IT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN 'WIP'
             WHEN (invhist_transtype='RM') THEN 'WIP'
             WHEN (invhist_transtype='RP') THEN 'PURCH'
             WHEN (invhist_transtype='RR') THEN 'CUST'
             WHEN (invhist_transtype='RS') THEN 'SHIP'
             WHEN (invhist_transtype='SH') THEN whs1.warehous_code
             WHEN (invhist_transtype='SI') THEN whs1.warehous_code
             WHEN (invhist_transtype='SV') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TR') THEN whs2.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs1.warehous_code
             ELSE ''
        END AS locfrom,
        CASE WHEN (invhist_transtype='TW') THEN whs2.warehous_code
             WHEN (invhist_transtype='AD') THEN whs1.warehous_code
             WHEN (invhist_transtype='CC') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN 'WIP'
             WHEN (invhist_transtype='IM') THEN 'WIP'
             WHEN (invhist_transtype='NN') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN whs1.warehous_code
             WHEN (invhist_transtype='RM') THEN whs1.warehous_code
             WHEN (invhist_transtype='RP') THEN whs1.warehous_code
             WHEN (invhist_transtype='RR') THEN whs1.warehous_code
             WHEN (invhist_transtype='RS') THEN whs1.warehous_code
             WHEN (invhist_transtype='RT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RX') THEN whs1.warehous_code
             WHEN (invhist_transtype='SH') THEN 'SHIP'
             WHEN (invhist_transtype='SI') THEN 'SCRAP'
             WHEN (invhist_transtype='SV') THEN 'SHIP'
 	    WHEN (invhist_transtype='TR') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs2.warehous_code
             ELSE ''
        END AS locto
   FROM itemsite, item, warehous AS whs1, invdetail, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
  WHERE ((invhist_hasdetail)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=whs1.warehous_id)
    AND (invdetail_invhist_id=invhist_id)
-   AND  ((invhist_transdate > DATE <? value("startDate") ?> - 1 AND
-	 invhist_transdate < DATE <? value("endDate") ?> + 1) )
+   AND  (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?> )
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("orderType") ?>
   AND  (invhist_ordtype=<? value("orderType") ?>)
 <? endif ?>
 <? if exists("orderNumber") ?>
   AND  (invhist_ordnumber ~ <? value("orderNumber") ?>)
   AND  (invhist_ordtype = 'SO')
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
+<? if exists("item_id") ?>
+  AND  (itemsite_item_id=<? value("item_id") ?>)
+<? endif ?>
 <? if exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                        AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id
                                    FROM plancode
                                   WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("itemgrp") ?>
    AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 );
 --------------------------------------------------------------------

 QUERY: footer
 SELECT formatMoney(sum(invhist_value_after-invhist_value_before)) AS transvalue_total
 FROM itemsite, item, warehous AS whs1, invhist LEFT OUTER JOIN
      warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
 WHERE ( (invhist_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (itemsite_warehous_id=whs1.warehous_id)
-  AND  ((invhist_transdate > DATE <? value("startDate") ?> - 1 AND
-	 invhist_transdate < DATE <? value("endDate") ?> + 1) )
+  AND  (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?> )
   AND  (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("orderType") ?>
   AND  (invhist_ordtype=<? value("orderType") ?>)
 <? endif ?>
 <? if exists("orderNumber") ?>
   AND  (invhist_ordnumber ~ <? value("orderNumber") ?>)
   AND  (invhist_ordtype = 'SO')
 <? endif ?>
 <? if exists("warehous_id") ?>
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
   AND  (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("itemgrp_id") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem
 		   WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("plancode_id") ?>
   AND  (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
   AND  (item_classcode_id IN (SELECT classcode_id
 			      FROM classcode
 			      WHERE (classcode_code ~ <? value ("classcode_pattern") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem, itemgrp
 		   WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
 		     AND  (itemgrp_name ~ <? value ("itemgrp_pattern") ?>))))
 <? elseif exists("plancode_pattern") ?>
   AND (itemsite_plancode_id IN (SELECT plancode_id
 				FROM plancode
 				WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("itemgrp") ?>
   AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 )


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
       formatPrice(invcitem_qty_invuomratio * invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
       formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) AS f_extprice,
       invcitem_notes,
       getInvcitemLotSerial(invcitem_id) AS lotserial,
 --Sub-select updated for 3.1 to support kitting
-      characteristicsToString('SI',(SELECT coitem_id FROM coitem, cohead, invchead, itemsite 
-      WHERE (cohead_number=invchead_ordernumber and invchead_id=<? value("invchead_id") ?>
-      and coitem_cohead_id=cohead_id 
-      and invcitem_item_id = item_id
-      and coitem_itemsite_id = itemsite_id
-      and itemsite_item_id = item_id
-      and coitem_linenumber=invcitem_linenumber)
-      ), '=', ', ') 
+      characteristicsToString('SI',invcitem_coitem_id, '=', ', ')
       AS coitem_characteristics
 FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;


 --------------------------------------------------------------------
 REPORT: InvoiceInformation
 QUERY: GroupHead
 SELECT invchead_id, invchead_ponumber,
        formatDate(invchead_shipdate) AS f_shipdate,
        formatDate(invchead_invcdate) AS f_invcdate,
        formatMoney(invoiceTotal(invchead_id)) AS f_amount,
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
-         invchead_misc_amount, invchead_freight, invchead_tax,
+         invchead_misc_amount, invchead_freight,
          invchead_billto_name, invchead_billto_address1,
          invchead_billto_address2, invchead_billto_address3,
          invchead_billto_city, invchead_billto_state, invchead_billto_zipcode,
          invchead_shipto_name, invchead_shipto_address1,
          invchead_shipto_address2, invchead_shipto_address3,
          invchead_shipto_city, invchead_shipto_state, invchead_shipto_zipcode,
          invchead_notes, invchead_invcnumber;


 --------------------------------------------------------------------
 REPORT: JobCosting
 QUERY: detail
-SELECT
-  id,
-  sort,
-  type,
-  code,
-  descrip,
-  f_qty,
-  uom,
-  f_cost,
-  cost
-FROM (
-<? if exists("showsu") ?>	
-SELECT wooper_id AS id,1 AS sort,<? value("setup") ?> AS type, wrkcnt_code AS code, wooper_descrip1 AS descrip,
-  formatqty(SUM(COALESCE(wooperpost_sutime,0))/60) AS f_qty,<? value("timeuom") ?> AS uom,
-  formatCost(SUM(COALESCE(wooperpost_sucost,0))) as f_cost, wooper_seqnumber,
-  SUM(COALESCE(wooperpost_sucost,0)) AS cost
-FROM wooper
-  LEFT OUTER JOIN wooperpost ON (wooper_id=wooperpost_wooper_id),
-  wrkcnt
-WHERE ((wooper_wo_id=<? value("wo_id") ?>)
-AND (wooper_wrkcnt_id=wrkcnt_id))
-GROUP BY wooper_id, wrkcnt_code, wooper_descrip1, wooper_seqnumber
-<? endif ?>
-<? if exists("showrt") ?>
-  <? if exists("showsu") ?>
-UNION
-  <? endif ?>
-SELECT wooper_id AS id,2 AS sort,<? value("runtime") ?> AS type, wrkcnt_code AS code, wooper_descrip1 AS descrip,
-  formatqty(SUM(COALESCE(wooperpost_rntime,0))/60) AS f_qty,<? value("timeuom") ?> AS uom,
-  formatCost(SUM(COALESCE(wooperpost_rncost,0))) AS f_cost, wooper_seqnumber,
-  SUM(COALESCE(wooperpost_rncost,0)) AS cost
-FROM wooper
-  LEFT OUTER JOIN wooperpost ON (wooper_id=wooperpost_wooper_id),
-  wrkcnt
-WHERE ((wooper_wo_id=<? value("wo_id") ?>)
-AND (wooper_wrkcnt_id=wrkcnt_id))
-GROUP BY wooper_id, wrkcnt_code, wooper_descrip1, wooper_seqnumber
-<? endif ?>
-<? if exists("showmatl") ?>
-  <? if exists("showsu") ?>
-UNION
-  <? elseif exists("showrt") ?>
-UNION
-  <? endif ?>
-SELECT womatl_id AS id,3 AS sort,<? value("material") ?> AS type, item_number AS code, item_descrip1 AS descrip,
-  formatqty(SUM(COALESCE(invhist_invqty,0))) AS f_qty,uom_name AS uom,
-  formatCost(SUM(COALESCE(invhist_invqty * invhist_unitcost,0))) AS f_cost,
-  NULL as wooper_seqnumber, SUM(COALESCE(invhist_invqty * invhist_unitcost,0)) AS cost
-  FROM womatl
-    LEFT OUTER JOIN womatlpost ON (womatl_id=womatlpost_womatl_id)
-    LEFT OUTER JOIN invhist ON (womatlpost_invhist_id=invhist_id),
-  itemsite, item, uom
-  WHERE ((womatl_wo_id=<? value("wo_id") ?>)
-  AND (womatl_itemsite_id=itemsite_id)
-  AND (itemsite_item_id=item_id)
-  AND (item_inv_uom_id=uom_id))
-  GROUP BY womatl_id, item_number, item_descrip1, uom_name
-<? endif ?>
-) AS data ORDER BY
-<? if exists("showsu") ?>
-wooper_seqnumber,
-<? elseif exists("showrt") ?>
-wooper_seqnumber,
-<? endif ?>
-sort,code;
+== MetaSQL statement manufacture-jobcosting


 --------------------------------------------------------------------
 REPORT: OrderActivityByProject
 QUERY: detail
+-- Group: orderActivityByProject
+-- Name:  detail
+-- Notes:
+
+SELECT *,
+  formatQty(qty) AS f_qty,
+  formatMoney(value) AS f_value,
+  'curr' AS qty_xtnumericrole,
+  'curr' AS value_xtnumericrole
+FROM (
 <? if exists("showSo") ?>
+----- QUOTES -----
 SELECT quhead_id AS id,
-       10 AS typeid,
-       text('Section 1 - Pro Forma Revenue (Quotes)') AS section,
-       text('Quote') AS type,
-       text(quhead_number) || '-' || text(quitem_linenumber) AS ordernumber,
-       CASE WHEN quhead_origin = 'C'  THEN 'Customer'
-            WHEN quhead_origin = 'S'  THEN 'Sales Rep'
-            WHEN quhead_origin = 'I'  THEN 'Internet'
+       15 AS type,
+       quhead_number::text AS subtype,
+       1 AS section,
+       <? value("quotes") ?> AS section_qtdisplayrole,
+       quhead_number::text AS name,
+       CASE WHEN (quhead_status = 'C') THEN
+         <? value("converted") ?>
+            WHEN (quhead_status = 'X') THEN
+         <? value("canceled") ?>
+            WHEN (COALESCE(quhead_expire, current_date + 1) > current_date) THEN
+         <? value("open") ?>
+            ELSE
+         <? value("expired") ?>
        END AS status,
-       item_number AS item,
-       formatQty(quitem_qtyord) AS f_qty,
-       formatQty(quitem_qtyord * quitem_price) AS f_value,
-       quitem_qtyord * quitem_price AS amt_value,
-       quitem_qtyord * quitem_price AS amt_report
-  FROM quhead, quitem, itemsite, item
- WHERE ((quhead_prj_id = <? value("prj_id") ?>)
-        AND (quitem_quhead_id = quhead_id)
-        AND (quitem_itemsite_id = itemsite_id)
-        AND (itemsite_item_id = item_id))
-
-UNION
-
-SELECT
-       cohead_id AS id,
-       20 AS typeid,
-       text('Section 2 - Booked Revenue') AS section,
-       text('Sales Order - See Invoice Section for Closed Line Amounts') AS type,
-       text(cohead_number) || '-' || text(coitem_linenumber) AS ordernumber,
-       CASE WHEN cohead_holdtype = 'N'  THEN 'Not On Hold'
-            WHEN cohead_holdtype = 'C'  THEN 'On Credit Hold'
-            WHEN cohead_holdtype = 'S'  THEN 'On Shipping Hold'
-            WHEN cohead_holdtype = 'P'  THEN 'On Packing Hold'
-            WHEN cohead_holdtype = 'R'  THEN 'On Return Hold'
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       NULL AS value,
+       1 AS xtindentrole
+  FROM quhead
+    JOIN quitem ON (quitem_quhead_id = quhead_id)
+ WHERE (quhead_prj_id = <? value("prj_id") ?>)
+GROUP BY quhead_id, quhead_number, quhead_status, quhead_expire, quhead_freight, quhead_misc
+
+UNION ALL
+
+SELECT quitem_id AS id,
+       17 AS type,
+       quhead_number::text AS subtype,
+       1 AS section,
+       <? value("quotes") ?> AS section_qtdisplayrole,
+       quitem_linenumber::text AS name,
+       CASE WHEN (quhead_status = 'C') THEN
+         <? value("converted") ?>
+            WHEN (quhead_status = 'X') THEN
+         <? value("canceled") ?>
+            WHEN (COALESCE(quhead_expire, current_date + 1) > current_date) THEN
+         <? value("open") ?>
+            ELSE
+         <? value("Expired") ?>
        END AS status,
        item_number AS item,
+       item_descrip1 || ' ' || item_descrip2 AS descrip,
+       quitem_qtyord,
+       uom_name AS uom,
+       (quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio) AS value,
+       2 AS xtindentrole
+  FROM quhead
+    JOIN quitem ON (quitem_quhead_id = quhead_id)
+    JOIN uom ON (quitem_qty_uom_id = uom_id)
+    JOIN itemsite ON (quitem_itemsite_id = itemsite_id)
+    JOIN item ON (itemsite_item_id = item_id)
+ WHERE (quhead_prj_id = <? value("prj_id") ?>)

-       formatQty(coitem_qtyord) AS f_qty,
-       CASE WHEN coitem_status = 'C' THEN 'SO Line Closed - See Invoice'
-            WHEN coitem_status <> 'C' THEN formatQty((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio))
-       END AS f_value,
-
-       CASE WHEN coitem_status = 'C' THEN 0
-            WHEN coitem_status <> 'C' THEN (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio)
-       END AS amt_value,
-
-       CASE WHEN coitem_status = 'C' THEN 0
-            WHEN coitem_status <> 'C' THEN (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio)
-       END AS amt_report
-
-  FROM cohead, coitem, itemsite, item
- WHERE ((cohead_prj_id = <? value("prj_id"?>)
-        AND (coitem_cohead_id = cohead_id)
-        AND (coitem_itemsite_id = itemsite_id)
-        AND (itemsite_item_id = item_id))
-
-UNION
-
-SELECT invchead_id AS id,
-       40 AS typeid,
-       text('Section 3 - Invoiced Revenue') AS section,
-       text('Invoice - Closed Sales Order Lines') AS type,
-       text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
-       CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
-            WHEN invchead_printed = 'N'  THEN 'Not Printed'
-       END AS status,
-
-       CASE WHEN invcitem_id <> '-1'  THEN item_number
-             WHEN invcitem_id = '-1'  THEN invcitem_number
-       END AS item,
-       formatQty(invcitem_ordered) AS f_qty,
-       formatQty((invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
-       (invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
-       (invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report
-
-  FROM invchead, invcitem, item
-  WHERE ((invchead_prj_id= <? value("prj_id") ?> )
-        AND (invcitem_invchead_id = invchead_id)
-        AND (invcitem_item_id = item_id)
-        AND (invchead_ordernumber in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id AND coitem_status = 'C')))
+UNION ALL

-UNION
-
-SELECT invchead_id AS id,
-       45 AS typeid,
-       text('Section 3 - Invoiced Revenue') AS section,
-       text('Invoice - Open Sales Order Lines') AS type,
-       text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
-       CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
-            WHEN invchead_printed = 'N'  THEN 'Not Printed'
+SELECT quhead_id AS id,
+       18 AS type,
+       quhead_number::text AS subtype,
+       1 AS section,
+       <? value("quotes") ?> AS section_qtdisplayrole,
+       <? value("total") ?> AS name,
+       NULL AS status,
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       SUM((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) AS value,
+       1 AS xtindentrole
+  FROM quhead
+    JOIN quitem ON (quitem_quhead_id = quhead_id)
+ WHERE (quhead_prj_id = <? value("prj_id") ?>)
+GROUP BY quhead_id, quhead_number
+
+UNION ALL
+
+------ SALES ORDERS ------
+SELECT cohead_id AS id,
+       25 AS type,
+       cohead_number::text AS subtype,
+       2 AS section,
+       <? value("sos") ?> AS section_qtdisplayrole,
+       cohead_number::text AS name,
+      COALESCE((SELECT
+                  CASE WHEN (coitem_status = 'O') THEN
+                    <? value("open") ?>
+                       WHEN (coitem_status = 'C') THEN
+                    <? value("closed" ?>
+                      ELSE
+                    <? value("canceled") ?>
+                  END
+                FROM
+               (SELECT coitem_status,
+                   CASE
+                     WHEN (coitem_status = 'O') THEN 1
+                     WHEN (coitem_status = 'C') then 2
+                     ELSE  3
+                  END AS type
+                  FROM coitem
+                 WHERE (coitem_cohead_id=cohead_id)
+                 ORDER BY type
+                 LIMIT 1) AS sts) ,'O')
+        AS status,
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       NULL AS value,
+       1 AS xtindentrole
+  FROM cohead
+    JOIN coitem ON (coitem_cohead_id = cohead_id)
+ WHERE (cohead_prj_id = <? value("prj_id") ?>)
+GROUP BY cohead_id, cohead_number
+
+UNION ALL
+
+SELECT coitem_id AS id,
+       27 AS type,
+       cohead_number::text AS subtype,
+       2 AS section,
+       <? value("sos") ?> AS section_qtdisplayrole,
+       coitem_linenumber::text AS name,
+       CASE WHEN (coitem_status = 'O') THEN
+         <? value("open") ?>
+            WHEN (coitem_status = 'C') THEN
+         <? value("closed") ?>
+            WHEN (coitem_status = 'X') THEN
+         <? value("canceled") ?>
        END AS status,
+       item_number AS item,
+       item_descrip1 || ' ' || item_descrip2 AS descrip,
+       coitem_qtyord,
+       uom_name AS uom,
+       (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio) AS value,
+       2 AS xtindentrole
+  FROM cohead
+    JOIN coitem ON (coitem_cohead_id = cohead_id)
+    JOIN uom ON (coitem_qty_uom_id = uom_id)
+    JOIN itemsite ON (coitem_itemsite_id = itemsite_id)
+    JOIN item ON (itemsite_item_id = item_id)
+ WHERE (cohead_prj_id = <? value("prj_id") ?>)
+
+UNION ALL
+
+SELECT cohead_id AS id,
+       28 AS type,
+       cohead_number::text AS subtype,
+       2 AS section,
+       <? value("sos") ?> AS section_qtdisplayrole,
+       <? value("total") ?> AS name,
+       NULL AS status,
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       SUM((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS value,
+       1 AS xtindentrole
+  FROM cohead
+    JOIN coitem ON (coitem_cohead_id = cohead_id)
+ WHERE (cohead_prj_id = <? value("prj_id") ?>)
+GROUP BY cohead_id, cohead_number

-       CASE WHEN invcitem_id <> '-1'  THEN item_number
-             WHEN invcitem_id = '-1'  THEN invcitem_number
-       END AS item,
-       formatQty(invcitem_ordered) AS f_qty,
-       text('SO Line Open - See Sales Order') AS f_value,
-       0 AS amt_value,
-       0 AS amt_report
-
-  FROM invchead, invcitem, item
-  WHERE ((invchead_prj_id= <? value("prj_id") ?> )
-        AND (invcitem_invchead_id = invchead_id)
-        AND (invcitem_item_id = item_id)
-        AND (invchead_ordernumber in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id AND coitem_status <> 'C')))
-
-UNION
+UNION ALL

+------ INVOICES -------
 SELECT invchead_id AS id,
-       50 AS typeid,
-       text('Section 3 - Invoiced Revenue') AS section,
-       text('Invoice - Misc., No SO Number - User Defined Item') AS type,
-       text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
-       CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
-            WHEN invchead_printed = 'N'  THEN 'Not Printed'
+       35 AS type,
+       invchead_invcnumber::text AS subtype,
+       3 AS section,
+       <? value("invoices") ?> AS section_qtdisplayrole,
+       invchead_invcnumber::text AS name,
+       CASE WHEN (invchead_posted) THEN
+         <? value("posted") ?>
+       ELSE <? value("unposted") ?>
        END AS status,
-
-       invcitem_number AS item,
-       formatQty(invcitem_billed) AS f_qty,
-       formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
-       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
-       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report
-
-  FROM invchead, invcitem
-  WHERE ((invchead_prj_id= <? value("prj_id") ?>)
-        AND (invcitem_invchead_id = invchead_id)
-        AND (invchead_ordernumber is null))
-
-
-UNION
-
-SELECT invchead_id AS id,
-       52 AS typeid,
-       text('Section 3 - Invoiced Revenue') AS section,
-       text('Invoice - Misc., User SO Number - User Defined Item ') AS type,
-       text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
-       CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
-            WHEN invchead_printed = 'N'  THEN 'Not Printed'
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       NULL AS value,
+       1 AS xtindentrole
+  FROM invchead
+    JOIN invcitem ON (invcitem_invchead_id = invchead_id)
+ WHERE (invchead_prj_id = <? value("prj_id") ?>)
+GROUP BY invchead_id, invchead_invcnumber, invchead_freight, invchead_misc_amount, invchead_posted
+
+UNION ALL
+
+SELECT invcitem_id AS id,
+       37 AS type,
+       invchead_invcnumber::text AS subtype,
+       3 AS section,
+       <? value("invoices") ?> AS section_qtdisplayrole,
+       invcitem_linenumber::text AS name,
+       CASE WHEN (invchead_posted) THEN
+         <? value("posted") ?>
+       ELSE <? value("unposted") ?>
        END AS status,
+       COALESCE(item_number,invcitem_number) AS item,
+       COALESCE(item_descrip1 || ' ' || item_descrip2,invcitem_descrip) AS descrip,
+       invcitem_billed AS qty,
+       uom_name AS uom,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS value,
+       2 AS xtindentrole
+  FROM invchead
+    JOIN invcitem ON (invcitem_invchead_id = invchead_id)
+    LEFT OUTER JOIN item ON (invcitem_item_id = item_id)
+    LEFT OUTER JOIN uom ON (invcitem_qty_uom_id = uom_id)
+ WHERE (invchead_prj_id = <? value("prj_id") ?>)

-       invcitem_number AS item,
-       formatQty(invcitem_billed) AS f_qty,
-       formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
-       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
-       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report
-
-  FROM invchead, invcitem
-  WHERE ((invchead_prj_id= <? value("prj_id") ?>)
-        AND (invcitem_invchead_id = invchead_id)
-        AND (invchead_ordernumber is not null)
-        AND (invcitem_item_id = -1))
-
-UNION
+UNION ALL

 SELECT invchead_id AS id,
-       56 AS typeid,
-       text('Section 3 - Invoiced Revenue') AS section,
-       text('Invoice - Misc., User SO Number - Normal Item') AS type,
-       text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
-       CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
-            WHEN invchead_printed = 'N'  THEN 'Not Printed'
-       END AS status,
-
-       CASE WHEN invcitem_id <> '-1'  THEN item_number
-             WHEN invcitem_id = '-1'  THEN invcitem_number
-       END AS item,
-       formatQty(invcitem_billed) AS f_qty,
-       formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
-       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
-       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report
-
-  FROM invchead, invcitem, item
-  WHERE ((invchead_prj_id= <? value("prj_id") ?> )
-        AND (invcitem_invchead_id = invchead_id)
-        AND (invcitem_item_id = item_id)
-        AND (invchead_ordernumber not in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id)
-        AND (invchead_ordernumber is not null)))
-
+       38 AS type,
+       invchead_invcnumber::text AS subtype,
+       3 AS section,
+       <? value("invoices") ?> AS section_qtdisplayrole,
+       <? value("total") ?> AS name,
+       NULL AS status,
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       SUM((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS value,
+       1 AS xtindentrole
+  FROM invchead
+    JOIN invcitem ON (invcitem_invchead_id = invchead_id)
+ WHERE (invchead_prj_id = <? value("prj_id") ?>)
+GROUP BY invchead_id, invchead_invcnumber

 <? endif ?>


 <? if exists("showWo") ?>

 <?   if exists("showSo") ?>

-UNION
+UNION ALL

 <?   endif ?>

+------ WORK ORDERS -------
 SELECT wo_id AS id,
-       90 AS typeid,
-       text('Section 6 - Work Order Expense') AS section,
-       text('Work Orders') AS type,
-       formatWoNumber(wo_id) AS ordernumber,
-       wo_status AS status,
+       45 AS type,
+       formatWoNumber(wo_id) AS subtype,
+       4 AS section,
+       <? value("wos") ?> AS section_qtdisplayrole,
+       formatWoNumber(wo_id) AS name,
+       CASE WHEN (wo_status = 'O') THEN
+         <? value("open") ?>
+            WHEN (wo_status = 'E') THEN
+         <? value("exploded") ?>
+            WHEN (wo_status = 'R') THEN
+         <? value("released") ?>
+            WHEN (wo_status = 'I') THEN
+         <? value("inprocess") ?>
+            WHEN (wo_status = 'C') THEN
+         <? value("closed") ?>
+       END AS status,
        item_number AS item,
-       formatQty(wo_qtyord) AS f_qty,
+       item_descrip1 || ' ' || item_descrip2 AS descrip,
+       wo_qtyord AS qty,
+       uom_name AS uom,
+       wo_postedvalue AS value,
+       1 AS xtindentrole
+  FROM wo
+    JOIN itemsite ON (itemsite_id=wo_itemsite_id)
+    JOIN item ON (itemsite_item_id=item_id)
+    JOIN uom ON (item_inv_uom_id=uom_id)
+ WHERE (wo_prj_id = <? value("prj_id") ?>)

-       CASE WHEN wo_status <> 'I'  THEN formatQty(wo_postedvalue)
-            WHEN wo_status  = 'I' THEN formatQty(wo_wipvalue)
-       END AS f_value,
-
-       CASE WHEN wo_status <> 'I'  THEN wo_postedvalue
-            WHEN wo_status  = 'I' THEN wo_wipvalue
-       END AS amt_value,
-
-       CASE WHEN wo_status <> 'I'  THEN wo_postedvalue * -1
-            WHEN wo_status  = 'I' THEN wo_wipvalue * -1
-       END AS amt_report
-
-  FROM wo, itemsite, item
- WHERE ((wo_prj_id=<? value("prj_id") ?>)
-       AND (wo_itemsite_id = itemsite_id)
-       AND (itemsite_item_id = item_id))
 <? endif ?>


 <? if exists("showPo") ?>
 <?   if exists("showSo") ?>
- UNION
+ UNION ALL
 <? elseif exists("showWo") ?>
- UNION
+ UNION ALL

 <? endif ?>
-
+------ PURCHASE REQUESTS ------
 SELECT pr_id AS id,
-       60 AS typeid,
-       text('Section 4 - Pro Forma Expense (Purchase Requests)') AS section,
-       text('Purchase Requests - Values At Standard') AS type,
-       text(pr_number) AS ordernumber,
-       pr_status AS status,
+       55 AS type,
+       pr_number::text || '-' || pr_subnumber::text AS subtype,
+       5 AS section,
+       <? value("prs") ?> AS section_qtdisplayrole,
+       pr_number::text || '-' || pr_subnumber::text AS name,
+       <? value("open") ?> AS status,
        item_number AS item,
-       formatQty(pr_qtyreq) AS f_qty,
-       formatQty(stdcost(item_id) * pr_qtyreq) AS f_value,
-       stdcost(item_id) * pr_qtyreq AS amt_value,
-       stdcost(item_id) * pr_qtyreq * -1 AS amt_report
-  FROM pr, item, itemsite
- WHERE ((pr_prj_id=<? value("prj_id") ?>)
-       AND (pr_itemsite_id = itemsite_id)
-       AND (itemsite_item_id = item_id)
-       AND (pr_itemsite_id = itemsite_id)
-       AND (itemsite_item_id = item_id))
-
-UNION
-
-SELECT poitem_id AS id,
-       70 AS typeid,
-       text('Section 5 - Purchase Expense') AS section,
-       text('Purchase Order - Stocked Items') AS type,
-       (text(pohead_number) || '-' || text(poitem_linenumber)) AS ordernumber,
-       poitem_status AS status,
-
-       item_number AS item,
-
-       formatQty(poitem_qty_ordered) AS f_qty,
-       formatQty(poitem_qty_ordered * poitem_unitprice) AS f_value,
-       poitem_qty_ordered * poitem_unitprice AS amt_value,
-       poitem_qty_ordered * poitem_unitprice * -1 AS amt_report
-  FROM pohead, poitem, itemsite, item
- WHERE ((poitem_pohead_id = pohead_id)
-   AND  (poitem_prj_id = <? value("prj_id") ?>)
-   AND  (poitem_itemsite_id = itemsite_id)
-   AND  (itemsite_item_id = item_id))
+       (item_descrip1 || ' ' || item_descrip2) AS descrip,
+       pr_qtyreq AS qty,
+       uom_name AS uom,
+       stdcost(item_id) * pr_qtyreq AS value,
+       1 AS xtindentrole
+  FROM pr
+    JOIN itemsite ON (itemsite_id = pr_itemsite_id)
+    JOIN item ON (itemsite_item_id = item_id)
+    JOIN uom ON (item_inv_uom_id = uom_id)
+ WHERE (pr_prj_id=<? value("prj_id") ?>)
+
+UNION ALL
+
+------ PURCHASE ORDERS ------
+SELECT pohead_id AS id,
+       65 AS type,
+       pohead_number::text AS subtype,
+       6 AS section,
+       <? value("pos") ?> AS section_qtdisplayrole,
+       pohead_number::text AS name,
+       CASE WHEN (pohead_status = 'U') THEN
+         <? value("unreleased") ?>
+            WHEN (pohead_status = 'O') THEN
+         <? value("open") ?>
+            WHEN (pohead_status = 'C') THEN
+         <? value("closed") ?>
+       END AS status,
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL AS uom,
+       NULL AS value,
+       1 AS xtindentrole
+  FROM pohead
+    JOIN poitem ON (poitem_pohead_id = pohead_id)
+ WHERE (poitem_prj_id = <? value("prj_id") ?>)
+GROUP BY pohead_id, pohead_number, pohead_freight, pohead_status

-UNION
+UNION ALL

 SELECT poitem_id AS id,
-       80 AS typeid,
-       text('Section 5 - Purchase Expense') AS section,
-       text('Purchase Order - Inventory Items') AS type,
-       (text(pohead_number) || '-' || text(poitem_linenumber)) AS ordernumber,
-       poitem_status AS status,
-
-       poitem_vend_item_number AS item,
-
-       formatQty(poitem_qty_ordered) AS f_qty,
-       formatQty(poitem_qty_ordered * poitem_unitprice) AS f_value,
-       poitem_qty_ordered * poitem_unitprice AS amt_value,
-       poitem_qty_ordered * poitem_unitprice * -1 AS amt_report
-
-  FROM pohead, poitem
- WHERE ((poitem_pohead_id = pohead_id)
-   AND  (poitem_prj_id = <? value("prj_id") ?>)
-   AND  (poitem_itemsite_id is null))
+       67 AS type,
+       pohead_number::text AS subtype,
+       6 AS section,
+       <? value("pos") ?> AS section_qtdisplayrole,
+       poitem_linenumber::text AS name,
+       CASE WHEN (poitem_status = 'U') THEN
+         <? value("unreleased") ?>
+            WHEN (poitem_status = 'O') THEN
+         <? value("open") ?>
+            WHEN (poitem_status = 'C') THEN
+         <? value("closed") ?>
+       END AS status,
+       COALESCE(item_number,poitem_vend_item_number) AS item,
+       COALESCE((item_descrip1 || ' ' || item_descrip2),poitem_vend_item_descrip) AS descrip,
+       poitem_qty_ordered,
+       poitem_vend_uom AS uom,
+       (poitem_qty_ordered * poitem_unitprice) AS value,
+       2 AS xtindentrole
+  FROM pohead
+    JOIN poitem ON (poitem_pohead_id = pohead_id)
+    LEFT OUTER JOIN itemsite ON (poitem_itemsite_id=itemsite_id)
+    LEFT OUTER JOIN item ON (itemsite_item_id = item_id)
+ WHERE (poitem_prj_id = <? value("prj_id") ?>)
+
+UNION ALL
+
+SELECT pohead_id AS id,
+       68 AS type,
+       pohead_number::text AS subtype,
+       6 AS section,
+       <? value("pos") ?> AS section_qtdisplayrole,
+       <? value("total") ?> AS name,
+       NULL AS status,
+       NULL::text AS item,
+       NULL::text AS descrip,
+       NULL AS qty,
+       NULL::text AS uom,
+       SUM(poitem_qty_ordered * poitem_unitprice) AS value,
+       1 AS xtindentrole
+  FROM pohead
+    JOIN poitem ON (poitem_pohead_id = pohead_id)
+ WHERE (poitem_prj_id = <? value("prj_id") ?>)
+GROUP BY pohead_id, pohead_number

 <? endif ?>

-ORDER BY section, typeid, ordernumber;
+) data
+ORDER BY section, subtype, type, id;


 --------------------------------------------------------------------
 REPORT: POLineItemsByVendor
 QUERY: detail
-SELECT CASE WHEN (itemsite_id IS NULL) THEN ( SELECT warehous_code
-                                              FROM warehous
-                                              WHERE (pohead_warehous_id=warehous_id) )
-            ELSE ( SELECT warehous_code
-                   FROM warehous
-                   WHERE (itemsite_warehous_id=warehous_id) )
-       END AS warehousecode,
-       pohead_number as f_ponumber,
-       formatDate(poitem_duedate) as f_duedate,
-       COALESCE(item_number, (text('NonInv - ') || poitem_vend_item_number)) AS itemnumber,
-       COALESCE(uom_name, poitem_vend_uom) AS itemuom,
-       formatQty(poitem_qty_ordered) as f_ordered,
-       formatQty(poitem_qty_received) as f_received,
-       formatQty(poitem_qty_returned) as f_returned
-  FROM pohead,
-       poitem LEFT OUTER JOIN
-       ( itemsite JOIN item
-         ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
-       ON (poitem_itemsite_id=itemsite_id)
- WHERE ((poitem_pohead_id=pohead_id)
-<? if exists("warehous_id") ?>
-   AND ( ( (itemsite_id IS NULL) AND (pohead_warehous_id=<? value("warehous_id") ?>) ) OR
-         ( (itemsite_id IS NOT NULL) AND (itemsite_warehous_id=<? value("warehous_id") ?>) ) )
-<? endif ?>
-<? if exists("agentUsername") ?>
-   AND (pohead_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-<? if exists("poNumber") ?>
-   AND (pohead_number=<? value("poNumber") ?>)
-<? endif ?>
-<? if exists("openItems") ?>
-   AND (poitem_status='O')
-<? elseif exists("closedItems") ?>
-   AND (poitem_status='C')
-<? endif ?>
-   AND (pohead_vend_id=<? value("vend_id") ?>))
-ORDER BY poitem_duedate, pohead_number, poitem_linenumber;
+== MetaSQL statement poItems-detail


 --------------------------------------------------------------------
 REPORT: POsByVendor
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
-       <? if exists("vend_id") ?>
-         (select vend_number from vend where vend_id=<? value("vend_id" ?>)
-       <? else ?>
-       TEXT('All Vendors')
-       <? endif ?>
-       AS f_vend,
+<? if exists("vend_id") ?>
+       (SELECT ('Vendor = ' || vend_name) FROM vendinfo WHERE vend_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+       (SELECT ('Vendor Type = ' || vendtype_code) FROM vendtype WHERE vendtype_id=<? value("vendtype_id") ?>)
+<? elseif exists("vendtype_pattern") ?>
+       ('Vendor Type pattern = ' || <? value("vendtype_pattern") ?>)
+<? else ?>
+       'All Vendors'
+<? endif ?>
+       AS selection,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("byReceiptDate") ?>
          TEXT('By Receipt Date')
        <? elseif exists("byDueDate") ?>
          TEXT('By Due Date')
        <? else ?>
          TEXT('By Order Date')
        <? endif ?>
        AS f_byDate,
        <? if exists("descrip_pattern") ?>
          TEXT('Where Item Description contains ' || <? value("descrip_pattern") ?>)
        <? else ?>
          TEXT('')
        <? endif ?>
        AS f_descrip



 --------------------------------------------------------------------
 REPORT: PackingList
 QUERY: lotdetail
-SELECT
-shiphead_number AS cosmisc_number,
-(orderhead_number || '-' || orderitem_linenumber) AS ordernumber,
-item_number,
-formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
-SUM(invdetail_qty) * -1 AS lotqty,
-SUM(invhist_invqty) as totalshipmentqty,
-invhist_transtype,
-formatdate(MAX(invhist_transdate)) AS invhistdate,
-formatdate(MAX(shipitem_transdate)) AS shiptransdate
-FROM shiphead,shipitem,invhist,invdetail,orderhead,orderitem,itemsite,item
-WHERE ( (shiphead_id = <? value("cosmisc_id") ?> )
-AND (shipitem_shiphead_id=shiphead_id)
-AND (invhist_id=shipitem_invhist_id)
-AND (invdetail_invhist_id=invhist_id)
-AND (orderhead_type=shiphead_order_type)
-AND (orderhead_id=shiphead_order_id)
-AND (orderitem_orderhead_type=shiphead_order_type)
-AND (orderitem_id=shipitem_orderitem_id)
-AND (itemsite_id=orderitem_itemsite_id)
-AND (item_id=itemsite_item_id)
-)
-GROUP BY shiphead_number,orderhead_number,item_number,invdetail_ls_id,
-orderitem_linenumber,invhist_transtype
+SELECT * FROM
+(
+  SELECT
+    shiphead_number AS cosmisc_number,
+    (cohead_number || '-' || coitem_linenumber) AS ordernumber,
+    item_number,
+    formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
+    SUM(invdetail_qty) * -1 AS lotqty,
+    SUM(invhist_invqty) as totalshipmentqty,
+    invhist_transtype,
+    formatdate(MAX(invhist_transdate)) AS invhistdate,
+    formatdate(MAX(shipitem_transdate)) AS shiptransdate
+  FROM shiphead
+    JOIN shipitem ON (shipitem_shiphead_id=shiphead_id)
+    JOIN invhist ON (invhist_id=shipitem_invhist_id)
+    JOIN invdetail ON (invdetail_invhist_id=invhist_id)
+    JOIN cohead ON (cohead_id=shiphead_order_id)
+    JOIN coitem ON (coitem_id=shipitem_orderitem_id)
+    JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
+    JOIN item ON (item_id=itemsite_item_id)
+  WHERE ( (shiphead_id = <? value("shiphead_id") ?> )
+    AND ('SO'=shiphead_order_type) )
+  GROUP BY shiphead_number,cohead_number,item_number,invdetail_ls_id,
+    coitem_linenumber,invhist_transtype
+<? if exists("MultiWhs") ?>
+UNION
+  SELECT
+    shiphead_number AS cosmisc_number,
+    (tohead_number || '-' || toitem_linenumber) AS ordernumber,
+    item_number,
+    formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
+    SUM(invdetail_qty) * -1 AS lotqty,
+    SUM(invhist_invqty) as totalshipmentqty,
+    invhist_transtype,
+    formatdate(MAX(invhist_transdate)) AS invhistdate,
+    formatdate(MAX(shipitem_transdate)) AS shiptransdate
+  FROM shiphead
+    JOIN shipitem ON (shipitem_shiphead_id=shiphead_id)
+    JOIN invhist ON (invhist_id=shipitem_invhist_id)
+    JOIN invdetail ON (invdetail_invhist_id=invhist_id)
+    JOIN tohead ON (tohead_id=shiphead_order_id)
+    JOIN toitem ON (toitem_id=shipitem_orderitem_id)
+    JOIN item ON (item_id=toitem_item_id)
+  WHERE ( (shiphead_id = <? value("shiphead_id") ?> )
+    AND ('TO'=shiphead_order_type) )
+  GROUP BY shiphead_number,tohead_number,item_number,invdetail_ls_id,
+    toitem_linenumber,invhist_transtype
+<? endif ?>
+) data
 ORDER BY ordernumber;


 --------------------------------------------------------------------
 REPORT: PendingWOMaterialAvailability
 QUERY: detail
-SELECT bomitem_seqnumber, item_number, item_descrip1, item_descrip2, uom_name,
-       formatQty(pendalloc) AS pendalloc,
-       formatQty(totalalloc + pendalloc) AS totalalloc,
-       formatQty(qoh) AS qoh,
-       formatQty(qoh + ordered - (totalalloc + pendalloc)) AS totalavail
-FROM ( SELECT bomitem_seqnumber, item_number,
-              item_descrip1, item_descrip2, uom_name,
-              ((itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, (bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap))) * <? value("buildQty") ?>) AS pendalloc,
-              qtyAllocated(itemsite_id, date(<? value("buildDate") ?>)) AS totalalloc,
-              noNeg(itemsite_qtyonhand) AS qoh,
-              qtyOrdered(itemsite_id, date(<? value("buildDate") ?>)) AS ordered
-   FROM itemsite, item, bomitem(<? value("item_id") ?>), uom
-       WHERE ((bomitem_item_id=itemsite_item_id)
-        AND (itemsite_item_id=item_id)
-        AND (item_inv_uom_id=uom_id)
-        AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-        AND (<? value("effectiveDate") ?> BETWEEN bomitem_effective AND (bomitem_expires-1)) ) ) AS data
-<? if exists("showShortages") ?>
-WHERE ((qoh + ordered - (totalalloc + pendalloc)) < 0.0)
-<? endif ?>
-ORDER BY bomitem_seqnumber;
+== MetaSQL statement pendingAvailability-detail


 --------------------------------------------------------------------
 REPORT: PickingListSOLocsNoClosedLines
 QUERY: detail
 SELECT
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        CASE WHEN (formatLocationName(location_id) = 'N/A') THEN itemsite_location_comments || ' ' || '(comment)'
             ELSE formatLocationName(location_id)
        END AS location_name,
        itemsite_location_comments AS location_comment,
        formatlotserialnumber(itemloc_ls_id),
        formatDate(itemloc_expiration, 'N/A') AS expiration,
        itemloc_qty AS location_qty_qty,
-	   CASE WHEN (fetchMetricBool('EnableSOReservationsByLocation')) THEN formatQty(qtyReservedLocation(itemloc_id, 'SO', coitem_id))
-	        ELSE formatQty(0)
-       END AS location_reserved_qty,
+<? if exists("EnableSOReservationsByLocation")
+       formatQty(qtyReservedLocation(itemloc_id, 'SO', coitem_id)) AS location_reserved_qty,
+<? else ?>
+       formatQty(0) AS location_reserved_qty,
+<? endif ?>
        itemuomtouomratio(item_id,item_inv_uom_id, coitem_qty_uom_id) * itemloc_qty AS loc_issue_uom_qty,
        formatqty(itemuomtouomratio(item_id,item_inv_uom_id, coitem_qty_uom_id) * itemloc_qty) AS loc_issue_uom_fmt,
        coitemuom.uom_name AS uom_name,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
        formatQty( ( SELECT COALESCE(SUM(shipitem_qty), 0)
                     FROM shipitem
                     WHERE ( (shipitem_orderitem_id=coitem_id)
                       AND   (NOT shipitem_shipped) ) ) ) AS atshipping,
        formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio))) AS shipordered,
        formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio))) AS shipshipped,
        formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio))) AS shipbalance,
        CASE WHEN (coitem_status='O' AND cust_creditstatus='H') THEN 'H'
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

 FROM coitem
      JOIN cohead ON (cohead_id = coitem_cohead_id)
 	 JOIN cust ON (cust_id = cohead_cust_id)
      JOIN itemsite ON (itemsite_id = coitem_itemsite_id)
 	 JOIN item ON (item_id = itemsite_item_id)
 	 JOIN whsinfo ON (warehous_id = itemsite_warehous_id)
 	 JOIN uom invuom ON (invuom.uom_id = item_inv_uom_id)
 	 JOIN uom coitemuom ON (coitemuom.uom_id = coitem_qty_uom_id)
      LEFT OUTER JOIN itemloc  ON (itemloc_itemsite_id = itemsite_id)
      LEFT OUTER JOIN location ON (itemloc_location_id = location_id)
  WHERE ( (coitem_status <> 'X')
    AND   (coitem_status <> 'C')
    AND   (item_type != 'K')
 --REMOVE LINE ABOVE AND CLOSED LINES WILL BE DISPLAYED
    AND   (coitem_cohead_id=<? value("sohead_id") ?>)
 )

 ORDER BY linenumber, expiration, location_name;


 --------------------------------------------------------------------
 REPORT: PricesByCustomer
 QUERY: detail
 SELECT itemid, sourcetype, schedulename, type, itemnumber,
        item_descrip1, item_descrip2,
        CASE WHEN (qtybreak = -1) THEN 'N/A'
             ELSE formatQty(qtybreak)
        END AS f_qtybreak,
        price, formatPrice(price) AS f_price,
        <? if exists("showCosts") ?>
          cost AS cost,
          formatCost(cost) AS f_cost,
          CASE WHEN ((price = 0) OR (cost = 0)) THEN 'N/A'
               ELSE formatScrap((price - cost) / price)
          END AS f_margin
        <? else ?>
          0 AS cost,
          text('') AS f_cost,
          text('') AS f_margin
        <? endif ?>
 FROM (
   SELECT ipsprice_id AS itemid, 1 AS sourcetype,
          ipshead_name AS schedulename, 'Customer' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, item
    WHERE ((ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (ipsass_cust_id=<? value("cust_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 2 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Type' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, item, cust
    WHERE ((ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (ipsass_custtype_id=cust_custtype_id)
      AND (cust_id=<? value("cust_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 3 AS sourcetype,
          ipshead_name AS schedulename, ('Sale' || '-' || sale_name) AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM sale, ipshead, ipsprice, item
    WHERE ((sale_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
 <? if not exists("showExpired") ?>
      AND (sale_enddate > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (sale_startdate <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT item_id AS itemid, 0 AS sourcetype,
          '' AS schedulename, 'List Price' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          -1 AS qtybreak, (item_listprice - (item_listprice * cust_discntprcnt)) AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM item, cust
    WHERE ( (item_sold)
+     AND (item_active)
      AND (cust_id=<? value("cust_id") ?>)
      AND (NOT item_exclusive) )
 ) AS data
 ORDER BY itemnumber, price;


 --------------------------------------------------------------------
 REPORT: PricesByCustomerType
 QUERY: detail
 SELECT itemid, sourcetype, schedulename, type, itemnumber,
        item_descrip1, item_descrip2,
        CASE WHEN (qtybreak = -1) THEN 'N/A'
             ELSE formatQty(qtybreak)
        END AS f_qtybreak,
        price, formatSalesPrice(price) AS f_price,
        <? if exists("showCosts") ?>
          cost AS cost,
          formatCost(cost) AS f_cost,
          CASE WHEN ((price = 0) OR (cost = 0)) THEN 'N/A'
               ELSE formatScrap((price - cost) / price)
          END AS f_margin
        <? else ?>
          0 AS cost,
          '' AS f_cost,
          '' AS f_margin
        <? endif ?>
 FROM (
   SELECT ipsprice_id AS itemid, 2 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Type' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, item
    WHERE ((ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (ipsass_custtype_id=<? value("custtype_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 3 AS sourcetype,
          ipshead_name AS schedulename, ('Sale' || '-' || sale_name) AS type,
          item_number AS itemnumber,
          item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM sale, ipshead, ipsprice, item
    WHERE ( (sale_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
 <? if not exists("showExpired") ?>
      AND (sale_enddate > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (sale_startdate <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT item_id AS itemid, 0 AS sourcetype,
          '' AS schedulename, 'List Price' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          -1 AS qtybreak, item_listprice AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM item
    WHERE ( (item_sold)
+     AND (item_active)
      AND (NOT item_exclusive) )
 ) AS data
 ORDER BY itemnumber, price;


 --------------------------------------------------------------------
 REPORT: PurchaseOrder
 QUERY: Foot
-SELECT formatExtPrice(COALESCE(SUM(poitem_qty_ordered * poitem_unitprice), 0)) AS f_subtotal,
-       formatExtPrice(COALESCE(SUM(poitem_freight)+pohead_freight,0)) AS f_totalfreight,
-       formatExtPrice(COALESCE(pohead_tax,0)) AS f_tax,
-       formatExtPrice(COALESCE(SUM(poitem_qty_ordered * poitem_unitprice), 0)+COALESCE(SUM(poitem_freight)+pohead_freight,0)+COALESCE(pohead_tax,0)) AS f_totaldue
-  FROM poitem, pohead
- WHERE ( (poitem_pohead_id=<? value("pohead_id") ?>)
-  AND (pohead_id=poitem_pohead_id) )
- GROUP BY pohead_freight, pohead_tax;
+SELECT formatExtPrice(subtotal) AS f_subtotal,
+       formatExtPrice(totalfreight) AS f_totalfreight,
+       formatExtPrice(tax) AS f_tax,
+       formatExtPrice(subtotal + totalfreight + tax) AS f_totaldue
+FROM
+( SELECT COALESCE(SUM(poitem_qty_ordered * poitem_unitprice), 0) AS subtotal,
+         COALESCE(SUM(poitem_freight)+pohead_freight,0) AS totalfreight,
+         (SELECT COALESCE(SUM(tax), 0.0)
+          FROM (SELECT ROUND(SUM(taxdetail_tax),2) AS tax
+                FROM tax
+                     JOIN calculateTaxDetailSummary('PO', <? value("pohead_id") ?>, 'T') ON (taxdetail_tax_id=tax_id)
+                GROUP BY tax_id) AS taxdata) AS tax
+  FROM pohead JOIN poitem ON (poitem_pohead_id=pohead_id)
+  WHERE (pohead_id=<? value("pohead_id") ?>)
+  GROUP BY pohead_freight ) AS data;
+


 --------------------------------------------------------------------
 REPORT: QOHByLocation
 QUERY: head
 SELECT (location_name||'-'||firstLine(location_descrip)) AS f_location,
        formatBoolYN(location_netable) AS f_netable,
        formatBoolYN(location_restrict) AS f_restricted,
-       warehous_code
+       warehous_code,
+       formatDate(<? value("asOf") ?>) AS asofdate
   FROM location, warehous
  WHERE ((location_warehous_id=warehous_id)
        AND (location_id=<? value("location_id") ?>) );
 --------------------------------------------------------------------

 QUERY: detail
-SELECT itemloc_id, warehous_code, item_number, item_descrip1, item_descrip2,
-       formatlotserialnumber(itemloc_ls_id) AS itemloc_lotserial, uom_name, formatQty(itemloc_qty) AS f_qoh
-FROM itemloc, itemsite, warehous, item, uom
-WHERE ((itemloc_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (item_inv_uom_id=uom_id)
- AND (itemsite_warehous_id=warehous_id)
- AND (itemloc_location_id=<? value("location_id") ?>))
-
-UNION SELECT -1, warehous_code, item_number, item_descrip1, item_descrip2,
-             'N/A', uom_name, formatQty(itemsite_qtyonhand)
-FROM itemsite, warehous, item, uom
-WHERE ((itemsite_item_id=item_id)
- AND (item_inv_uom_id=uom_id)
- AND (itemsite_warehous_id=warehous_id)
- AND (NOT itemsite_loccntrl)
- AND (itemsite_location_id=<? value("location_id") ?>))
-
-ORDER BY item_number;
+== MetaSQL statement qoh-detail


 --------------------------------------------------------------------
 REPORT: QOHByParameterList
 QUERY: detail
 SELECT itemsite_id,
        detail,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        warehous_code,
        formatQty(reorderlevel) AS f_reorderlevel,
        formatQty(qoh) AS f_qoh,
        CASE WHEN (NOT useDefaultLocation(itemsite_id)) THEN 'None'
                  ELSE defaultLocationName(itemsite_id)
        END AS defaultlocation,
        formatQty(nonnetable) AS f_nonnetable,
        <? if exists("showValue") ?>
          formatCost(standardcost)
        <? else ?>
          text('')
        <? endif ?>
        AS f_unitcost,
        <? if exists("showValue") ?>
-         formatExtPrice(noNeg(standardcost * qoh))
+         formatExtPrice((standardcost * qoh))
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if exists("showValue") ?>
-         CASE WHEN (itemsite_loccntrl) THEN formatExtPrice(noNeg(standardcost * nonnetable))
+         CASE WHEN (itemsite_loccntrl) THEN formatExtPrice((standardcost * nonnetable))
               ELSE 'N/A'
          END
        <? else ?>
          text('')
        <? endif ?>
        AS f_nonnetvalue,
        standardcost,
        qoh,
        nonnetable,
-       noNeg(qoh) AS r_qoh,
-       noNeg(nonnetable) AS r_nonnetable,
+       qoh AS r_qoh,
+       nonnetable AS r_nonnetable,
        <? if exists("showValue") ?>
-         noNeg(standardcost * qoh)
+         (standardcost * qoh)
        <? else ?>
          0
        <? endif ?>
        AS r_value,
        <? if exists("showValue") ?>
-         CASE WHEN (itemsite_loccntrl) THEN noNeg(standardcost * nonnetable)
+         CASE WHEN (itemsite_loccntrl) THEN (standardcost * nonnetable)
               ELSE 0
          END
        <? else ?>
          0
        <? endif ?>
        AS r_nonnetvalue,
        <? if exists("showValue") ?>
          <? if exists("usePostedCosts") ?>
            CASE WHEN(itemsite_costmethod='A') THEN text('Average')
                 WHEN(itemsite_costmethod='S') THEN text('Standard')
                 WHEN(itemsite_costmethod='J') THEN text('Job')
                 WHEN(itemsite_costmethod='N') THEN text('None')
                 ELSE text('UNKNOWN')
            END
          <? else ?>
            text('')
          <? endif ?>
        <? else ?>
          text('')
        <? endif ?>
        AS f_costmethod
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
          FROM itemsite, item, uom, warehous
         WHERE ((itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (itemsite_active)
 <? if exists("classcode_id") ?>
           AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
           AND (item_classcode_id IN (SELECT classcode_id
                                        FROM classcode
                                       WHERE (classcode_code ~ <? value("classcode_pattern") ?>) ) )
 <? elseif exists("itemgrp_id") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem, itemgrp
                             WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                               AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("itemgrp") ?>
           AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
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
 ORDER BY warehous_code, item_number;



 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByDate
 QUERY: detail
-SELECT porecv_id, porecv_ponumber,
-       vend_name,
-       formatDate(porecv_duedate) AS f_scheddate,
-       formatDate(porecv_date) AS f_recvdate,
-       item_number, item_descrip1,
-       item_descrip2,
-       text('Received') AS f_rcvdrtnd,
-       formatQty(porecv_qty) AS f_qty,
-       <? if exists("showVariances") ?>
-         formatCost(porecv_purchcost)
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_purchcost,
-       <? if exists("showVariances") ?>
-         CASE WHEN (porecv_recvcost IS NULL) THEN text('N/A')
-              ELSE formatCost(porecv_recvcost)
-         END
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_recvcost,
-       porecv_date AS sortdate
-FROM porecv, itemsite, item, vend
-WHERE ((porecv_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (porecv_vend_id=vend_id)
- AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
- AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-)
-UNION SELECT poreject_id, poreject_ponumber,
-             vend_name,
-             '' AS f_duedate,
-             formatDate(poreject_date) AS f_recvdate,
-             item_number,
-             item_descrip1, item_descrip2,
-             text('Returned'),
-             formatQty(poreject_qty) AS f_recvqty,
-             '' AS f_purchcost,
-             '' AS f_recvcost,
-             poreject_date AS sortdate
-FROM poreject, itemsite, item, vend
-WHERE ((poreject_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (poreject_vend_id=vend_id)
- AND (date(poreject_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
- AND (poreject_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-)
-ORDER BY sortdate DESC
+== MetaSQL statement receivings-detail


 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByItem
 QUERY: detail
-SELECT porecv_id, porecv_ponumber, vend_name,
-       formatDate(porecv_duedate) as f_scheddate,
-       formatDate(porecv_date) as f_recvdate,
-       porecv_vend_item_number,
-       porecv_vend_item_descrip,
-       text('Received') as f_rcvdrtnd,
-       formatQty(porecv_qty) as f_qty,
-       <? if exists("showVariances") ?>
-         formatCost(porecv_purchcost)
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_purchcost,
-       <? if exists("showVariances") ?>
-         CASE WHEN (porecv_recvcost IS NULL) THEN text('N/A')
-              ELSE formatCost(porecv_recvcost)
-         END
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_recvcost,
-       porecv_date AS sortdate
-FROM porecv, vend, itemsite
-WHERE ( (porecv_vend_id=vend_id)
- AND (porecv_itemsite_id=itemsite_id)
- AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
- AND (itemsite_item_id=<? value("item_id") ?>)
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
- AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-)
-UNION SELECT poreject_id, poreject_ponumber, vend_name,
-             '',
-             formatDate(poreject_date),
-             poreject_vend_item_number, poreject_vend_item_descrip, 'Returned',
-             formatQty(poreject_qty),
-             '',
-             '',
-             poreject_date AS sortdate
-FROM poreject, vend, itemsite
-WHERE ( (poreject_vend_id=vend_id)
- AND (poreject_itemsite_id=itemsite_id)
- AND (date(poreject_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
- AND (itemsite_item_id=<? value("item_id") ?>)
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
- AND (poreject_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-)
-ORDER BY sortdate DESC
+== MetaSQL statement receivings-detail


 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByVendor
 QUERY: detail
-SELECT porecv_id, porecv_ponumber,
-       formatDate(porecv_duedate) as f_scheddate,
-       formatDate(porecv_date) as f_recvdate,
-       item_number, item_descrip1, item_descrip2,
-       text('Received') as f_rcvdrtnd,
-       formatQty(porecv_qty) as f_qty,
-       <? if exists("showVariances") ?>
-         formatCost(porecv_purchcost)
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_purchcost,
-       <? if exists("showVariances") ?>
-         CASE WHEN (porecv_recvcost IS NULL) THEN text('Returned')
-              ELSE formatCost(porecv_recvcost)
-         END
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_recvcost,
-       porecv_date AS sortdate
-FROM porecv, itemsite, item, vend
-WHERE ( (porecv_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (porecv_vend_id=<? value("vend_id") ?>)
- AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
- AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-)
-UNION SELECT poreject_id, poreject_ponumber,
-             '',
-             formatDate(poreject_date),
-             item_number, item_descrip1, item_descrip2, 'Returned',
-             formatQty(poreject_qty),
-             '',
-             '',
-             poreject_date AS sortdate
-FROM poreject, itemsite, item, vend
-WHERE ( (poreject_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (poreject_vend_id=vend_id)
- AND (poreject_vend_id=<? value("vend_id") ?>)
- AND (date(poreject_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
- AND (poreject_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
-)
-ORDER BY sortdate DESC
+== MetaSQL statement receivings-detail


 --------------------------------------------------------------------
 REPORT: StandardJournalHistory
 QUERY: detail
 SELECT formatDate(gltrans_date) AS transdate,
        gltrans_journalnumber,
        gltrans_docnumber,
       (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(gltrans_amount * -1)
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        formatBoolYN(gltrans_posted) AS f_posted
   FROM gltrans, accnt
  WHERE ( (gltrans_accnt_id=accnt_id)
+   AND   (NOT gltrans_deleted)
    AND   (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND   (gltrans_doctype='ST') )
 ORDER BY gltrans_date, gltrans_sequence, gltrans_docnumber, gltrans_amount;


 --------------------------------------------------------------------
 REPORT: Statement
 QUERY: detail
 SELECT CASE WHEN (araging_doctype = 'I') THEN <? value("invoice") ?>
             WHEN (araging_doctype = 'D') THEN <? value("debit") ?>
             WHEN (araging_doctype = 'C') THEN <? value("credit") ?>
             WHEN (araging_doctype = 'R') THEN <? value("deposit") ?>
             ELSE 'Misc.'
        END AS doctype,
        araging_docnumber AS f_docnumber,
        formatDate(CAST(araging_docdate AS DATE)) AS f_docdate,
        CASE WHEN (araging_doctype IN ('I','D')) THEN formatDate(araging_duedate)
             ELSE ''
        END AS f_duedate,
        formatMoney(araging_aropen_amount) AS f_amount,
        formatMoney(araging_aropen_amount - araging_total_val) AS f_applied,
        formatMoney(araging_total_val) AS f_balance
-FROM araging(<? value("asofdate") ?>, true)
+FROM araging(<? value("asofdate") ?>, true, false)
 WHERE ((araging_cust_id = <? value("cust_id") ?>)
    AND (abs(araging_aropen_amount) > 0)
       )
 ORDER BY araging_duedate;
 --------------------------------------------------------------------

 QUERY: foot
 SELECT formatMoney(SUM(araging_cur_val)) AS f_current,
        formatMoney(SUM(araging_thirty_val)) AS f_thirty,
        formatMoney(SUM(araging_sixty_val)) AS f_sixty,
        formatMoney(SUM(araging_ninety_val)) AS f_ninety,
        formatMoney(SUM(araging_plus_val)) AS f_plus,
        formatMoney(SUM(araging_total_val)) AS f_total
-FROM araging(<? value("asofdate") ?>, true)
+FROM araging(<? value("asofdate") ?>, true, false)
 WHERE ((abs(araging_aropen_amount) > 0)
    AND (araging_cust_id = <? value("cust_id") ?>));


 --------------------------------------------------------------------
 REPORT: SummarizedGLTransactions
 QUERY: detail
 SELECT data.accnt_id AS accnt_id,
 -- account information
        formatGLAccount(data.accnt_id) AS account,
        accnt_descrip,
        f_debit,
        f_credit,
 -- transactionn details
        formatDate(gltrans_date) AS transdate,
        gltrans_source,
        gltrans_doctype,
        gltrans_docnumber,
        gltrans_notes,
        f_debitdetail,
        f_creditdetail,
        <? if exists("showUsernames") ?>
          gltrans_username
        <? else ?>
          text('')
        <? endif ?>
        AS f_username
   FROM ( SELECT accnt_id,
                 accnt_number,
                 accnt_profit,
                 accnt_sub,
                 accnt_descrip,
                 formatMoney( SUM( CASE WHEN (gltrans_amount < 0) THEN (gltrans_amount * -1)
                                        ELSE 0
                                   END ) ) AS f_debit,
                 formatMoney( SUM( CASE WHEN (gltrans_amount > 0) THEN gltrans_amount
                                        ELSE 0
                                   END ) ) AS f_credit
            FROM gltrans, accnt
           WHERE ( (gltrans_accnt_id=accnt_id)
+            AND (NOT gltrans_deleted)
             AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
          <? if exists("source") ?>
             AND (gltrans_source=<? value("source") ?>)
          <? endif ?>
          <? if exists("unpostedTransactions") ?>
             AND (NOT gltrans_posted)
          <? elseif exists("postedTransactions") ?>
             AND (gltrans_posted)
          <? endif ?>
          )
          GROUP BY accnt_id, accnt_number, accnt_profit, accnt_sub, accnt_descrip
        ) AS data LEFT OUTER JOIN
        ( SELECT accnt_id,
                 gltrans_date,
                 gltrans_created,
                 gltrans_source,
                 gltrans_doctype,
                 gltrans_docnumber,
                 gltrans_notes,
                 gltrans_username,
                 CASE WHEN (gltrans_amount < 0) THEN formatMoney(gltrans_amount * -1)
                      ELSE ''
                 END AS f_debitdetail,
                 CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
                      ELSE ''
                 END AS f_creditdetail
            FROM gltrans, accnt
           WHERE ((gltrans_accnt_id=accnt_id)
+            AND (NOT gltrans_deleted)
             AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
          <? if exists("source") ?>
             AND (gltrans_source=<? value("source") ?>)
          <? endif ?>
          <? if exists("unpostedTransactions") ?>
             AND (NOT gltrans_posted)
          <? elseif exists("postedTransactions") ?>
             AND (gltrans_posted)
          <? endif ?>
                 )
        ) AS data2 ON (data.accnt_id=data2.accnt_id)
 ORDER BY accnt_number, accnt_profit, accnt_sub, gltrans_date DESC, gltrans_created;


 --------------------------------------------------------------------
 REPORT: TaxAuthoritiesMasterList
 QUERY: detail
-select taxauth_code, taxauth_name
-  from taxauth
-order by taxauth_code;
+== MetaSQL statement taxAuthorities-detail


 --------------------------------------------------------------------
 REPORT: TimePhasedSalesHistoryByCustomerByItem
 QUERY: head
-SELECT <? if exists("cust_id") ?>
-         (SELECT cust_name from cust where cust_id=<? value("cust_id") ?>)
-       <? elseif exists("custtype_id") ?>
-         (SELECT (custtype_code||'-'||custtype_descrip)
-            FROM custtype
-           WHERE custtype_id=<? value("custtype_id") ?>)
-       <? elseif exists("custtype_pattern") ?>
-         text(<? value("custtype_pattern") ?>)
-       <? else ?>
-         text('All Customers')
-       <? endif ?>
-       AS custtype,
+SELECT cust_number,
+       cust_name,
+       salesrep_number,
+       salesrep_name,
        <? if exists("procat_id") ?>
          (SELECT (prodcat_code||'-'||prodcat_descrip)
             FROM prodcat
            WHERE prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
-       AS prodcat;
+       AS prodcat
+FROM custinfo JOIN salesrep ON (salesrep_id=cust_salesrep_id)
+WHERE (cust_id=<? value("cust_id") ?>);


 --------------------------------------------------------------------
 REPORT: UnpostedGLTransactions
 QUERY: detail
 SELECT gltrans_id,
        formatDate(gltrans_date) AS transdate,
        gltrans_source,
        gltrans_doctype,
        gltrans_docnumber,
        invhist_docnumber,
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
        gltrans_amount * -1 as balance_amt
 --
   FROM period, gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
        LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id AND gltrans_docnumber='Misc.')
 WHERE (NOT gltrans_posted
+  AND (NOT gltrans_deleted)
   AND  (gltrans_date BETWEEN period_start AND period_end)
 <? if exists("period_id") ?>
   AND  (period_id=<? value("period_id") ?>)
 <? endif ?>
 )
 ORDER BY gltrans_created, gltrans_sequence, gltrans_amount;


 --------------------------------------------------------------------
 REPORT: VendorMasterList
 QUERY: detail
-SELECT vend_number,
-       vend_name,
-       vend_address1,
-       vend_address2,
-       vend_address3,
-       vend_city,
-       vend_state,
-       vend_zip
-FROM vend
-ORDER BY vend_number
+== MetaSQL statement vendors-detail


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
-         text('None')
+         text('All Materials')
        <? endif ?>
        AS itemfiltertext,
        <? if exists("IndentedParentChild") ?>
          text('Indented Works Orders')
        <? elseif exists("summarizedParentChild") ?>
          text('Summarized Parent/Child Orders')
        <? else ?>
          text('Parent Order Only')
        <? endif ?>
        AS wofiltertext
   FROM wo, itemsite, item, uom, warehous
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );