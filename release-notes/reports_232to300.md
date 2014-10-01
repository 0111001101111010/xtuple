--------------------------------------------------------------------
NEW REPORTS:
EmployeeList
PickListWOShowLocations
PickingListSOLocsNoClosedLines
PendingWOMaterialAvailability
--------------------------------------------------------------------
CHANGED REPORTS:
APAging
BillingEditList
CapacityUOMsByClassCode
CashReceiptsJournal
DetailedInventoryHistoryByLocation
ExpiredInventoryByClassCode
InventoryHistoryByParameterList
Invoice
PackingList
PurchaseOrder
QOHByLocation
SummarizedSalesByCustomerType


 --------------------------------------------------------------------
 REPORT: APAging
 QUERY: detail
 SELECT
 	apaging_docdate,
 	apaging_duedate,
 	apaging_ponumber,
 	apaging_docnumber,
           apaging_invcnumber,
 	apaging_doctype,
 	apaging_vend_id,
 	apaging_vend_number,
 	apaging_vend_name,
 	apaging_vend_vendtype_id,
 	apaging_vendtype_code,
 	apaging_terms_descrip,
 	apaging_apopen_amount,
 	apaging_cur_amt,
 	apaging_cur_val,
 	apaging_thirty_amt,
 	apaging_thirty_val,
 	apaging_sixty_amt,
 	apaging_sixty_val,
 	apaging_ninety_amt,
 	apaging_ninety_val,
 	apaging_plus_amt,
 	apaging_plus_val,
 	apaging_total_amt,
 	apaging_total_val,
 	apaging_disc_amt,
 	apaging_disc_val,
 	apaging_discdate,
 	apaging_discdays,
 	apaging_discprcnt
-FROM apaging(<? value("relDate") ?>)
+FROM apaging(<? value("relDate") ?>, <? if exists("useDocDate") ?>true<? else ?>false<? endif ?>)
 <? if exists("vend_id") ?>
    WHERE (apaging_vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
    WHERE (apaging_vend_vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
    WHERE (apaging_vendtype_code ~ <? value("vendtype_pattern") ?>)
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
-       '' AS credit
+       '' AS credit,
+       currConcat(cobmisc_curr_id)      AS currabbr
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
-       cobmisc_freight			AS runningextprice,
+       currtobase(cobmisc_curr_id, cobmisc_freight, cobmisc_invcdate) AS runningextprice,
        '' AS debit,
-       (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit
+       (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
+       currConcat(cobmisc_curr_id)      AS currabbr
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
-	cobmisc_misc								AS runningextprice,
+	currToBase(cobmisc_curr_id, cobmisc_misc, cobmisc_invcdate)				AS runningextprice,
        '' AS debit,
-        (formatGLAccount(misc.accnt_id) || ' - ' || misc.accnt_descrip) 	AS credit
+        (formatGLAccount(misc.accnt_id) || ' - ' || misc.accnt_descrip) 	AS credit,
+        currConcat(cobmisc_curr_id)     AS currabbr
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
 	tax_descrip	 							AS descrip,
         ''		 							AS f_ordernumber,
 	cohead_number								as ordernumber,
 	-1				 					AS linenumber,
 	''						 			AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cobmisc_tax) 						AS price,
         formatExtPrice(cobmisc_tax) 						AS extprice,
 	cobmisc_tax								AS subextprice,
-	cobmisc_tax								AS runningextprice,
+	currtobase(cobmisc_tax_curr_id, cobmisc_tax, cobmisc_invcdate)				AS runningextprice,
        '' AS debit,
-        (formatGLAccount(taxaccnt.accnt_id) || ' - ' || taxaccnt.accnt_descrip) AS credit
+        (formatGLAccount(taxaccnt.accnt_id) || ' - ' || taxaccnt.accnt_descrip) AS credit,
+        currConcat(cobmisc_tax_curr_id)     AS currabbr
 FROM cobmisc, cohead, accnt AS taxaccnt, tax
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (tax_sales_accnt_id=taxaccnt.accnt_id)
  AND (cohead_tax_id=tax_id)
  AND (NOT cobmisc_posted)
  AND (cobmisc_tax <> 0)
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
-	((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio))			AS runningextprice,
+	currtobase(cobmisc_curr_id, ((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)), cobmisc_invcdate) AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
-                     AND (salesaccnt_id=findSalesAccnt(itemsite_id, cohead_cust_id)))), 'Not Assigned') AS credit
+                     AND (salesaccnt_id=findSalesAccnt(itemsite_id, cohead_cust_id)))), 'Not Assigned') AS credit,
+        currConcat(cobmisc_curr_id)     AS currabbr
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
-                    WHERE (accnt_id=findARAccount(cmhead_cust_id)) ), 'Not Assigned') AS credit
+                    WHERE (accnt_id=findARAccount(cmhead_cust_id)) ), 'Not Assigned') AS credit,
+        currConcat(cmhead_curr_id)     AS currabbr
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
-	(cmhead_freight * -1)							AS runningextprice,
+	currtobase(cmhead_curr_id, cmhead_freight * -1, cmhead_gldistdate)				AS runningextprice,
         (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
-        '' AS debit
+        '' AS debit,
+        currConcat(cmhead_curr_id)     AS currabbr
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
-	iteminvuom,
+	item_invuom                                                             AS iteminvuom,
         formatQty(cmitem_qtycredit) 						AS qtytobill,
         formatPrice(cmitem_unitprice) 						AS price,
         formatExtPrice((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio)) 	AS extprice,
 	((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1)			AS subextprice,
-	((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1)			AS runningextprice,
+	currtobase(cmhead_curr_id, ((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1), cmhead_gldistdate) AS runningextprice,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cmhead_cust_id)))), 'Not Assigned') AS credit,
-        '' AS debit
+        '' AS debit,
+        currConcat(cmhead_curr_id)     AS currabbr
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
 REPORT: CapacityUOMsByClassCode
 QUERY: detail
 SELECT classcode_code,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        itemcapuom(item_id) AS capuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
-       itemaltcapuom(item_id) altcapuom,
+       itemaltcapuom(item_id) AS altcapuom,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        item_shipuom,
        formatRatio(iteminvpricerat(item_id)) AS shipratio
   FROM item, classcode, uom
  WHERE ((item_classcode_id=classcode_id)
    AND (item_inv_uom_id=uom_id)
 <? if exists("classcode_id") ?>
    AND (classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (classcode_code ~ <? value("classcode_pattern") ?>)
 <? endif ?>
 )
 ORDER BY classcode_code, item_number;

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
  WHERE ((arapply_postdate = CURRENT_DATE)
-   AND  (arapply_journalnumber=<? value("journalNumber") ?>)
+   AND  (arapply_journalnumber=text(<? value("journalNumber") ?>))
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
  WHERE ((aropen_docdate = CURRENT_DATE)
    AND  (aropen_journalnumber=<? value("journalNumber") ?>)
 )

 --------------------------------------------------------------------
 REPORT: DetailedInventoryHistoryByLocation
 QUERY: detail
 SELECT invhist_id,
        formatDateTime(invhist_transdate) AS transdate,
        invhist_transtype,
        (invhist_ordtype || '-' || invhist_ordnumber) AS ordernumber,
        invhist_invuom,
        item_number,
        item_descrip1,
        item_descrip2,
-       invdetail_lotserial,
+       formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
        formatQty(invdetail_qty) AS transqty,
        formatQty(invdetail_qty_before) AS qohbefore,
        formatQty(invdetail_qty_after) AS qohafter,
        invhist_user AS username,
        (select warehous_code from warehous where warehous_id=itemsite_warehous_id) as warehous_code
   FROM invdetail, invhist, itemsite, item
  WHERE ((invdetail_invhist_id=invhist_id)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (invdetail_location_id=<? value("location_id") ?>)
    AND (date(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 )
 ORDER BY invhist_transdate DESC, invhist_transtype;

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
+       <? if exists("perishability") ?>
+       'Perishability'
+       <? else ?>
+       'Warranty'
+       <? endif ?> AS expiretype,
        <? if exists("showValue") ?>
            <? if exists("useActualCosts") ?>
              text('Show Inventory Value with Actual Costs')
            <? else ?>
              text('Show Inventory Value with Standard Costs')
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
-       itemloc_lotserial,
+       ls_number AS itemloc_lotserial,
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
-                itemloc_lotserial,
+                ls_number,
                 itemloc_qty,
+<? if exists("perishability") ?>
                 itemloc_expiration,
+<? elseif exists("warranty") ?>
+                itemloc_warrpurc AS itemloc_expiration,
+<? endif ?>
                 <? if exists("useActualCosts") ?>
                   actcost(itemsite_item_id)
                 <? else ?>
                   stdcost(itemsite_item_id)
                 <? endif ?>
                 AS cost
-           FROM itemloc, itemsite, item, warehous, uom
+           FROM itemloc, itemsite, item, warehous, uom, ls
           WHERE ((itemloc_itemsite_id=itemsite_id)
+            AND (itemloc_ls_id=ls_id)
             AND (itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (itemsite_warehous_id=warehous_id)
+<? if exists("perishability") ?>
             AND (itemsite_perishable)
             AND (itemloc_expiration < (CURRENT_DATE + <? value("thresholdDays") ?>))
+<? elseif exists("warranty") ?>
+            AND (itemsite_warrpurc)
+            AND (itemloc_warrpurc < (CURRENT_DATE + <? value("thresholdDays") ?>))
+<? endif ?>
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
 REPORT: InventoryHistoryByParameterList
 QUERY: detail
 SELECT invhist_id,
        invhist_transdate,
        formatDateTime(invhist_transdate) AS transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(invhist_invqty) AS transqty,
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
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
    AND (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
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
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
        invhist_user AS username,
        invhist_posted,
        invdetail_id,
-       CASE WHEN (invdetail_location_id=-1) THEN invdetail_lotserial
-            WHEN (invdetail_lotserial IS NULL) THEN formatLocationName(invdetail_location_id)
-            ELSE (formatLocationName(invdetail_location_id) || '-' || invdetail_lotserial)
+       CASE WHEN (invdetail_location_id=-1) THEN formatlotserialnumber(invdetail_ls_id)
+            WHEN (invdetail_ls_id IS NULL) THEN formatLocationName(invdetail_location_id)
+            ELSE (formatLocationName(invdetail_location_id) || '-' || formatlotserialnumber(invdetail_ls_id))
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
    AND (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
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
 REPORT: Invoice
 QUERY: GroupHead
-SELECT remitto.*,
+SELECT
+       --remitto.*,
+remitto_name,
+formatAddr(remitto_address1, remitto_address2, remitto_address3, remitto_citystatezip, remitto_country) AS remitto_adr,
        TEXT(invchead_invcnumber) AS invoicenumber,
        formatDate(invchead_invcdate) AS f_invoicedate,
        cust_number,
        invchead_billto_name,
        formatAddr(invchead_billto_address1, invchead_billto_address2, invchead_billto_address3, ( invchead_billto_city || '  ' || invchead_billto_state || '  ' || invchead_billto_zipcode ), invchead_billto_country) AS f_billtoaddress,
        invchead_billto_phone,
        invchead_shipto_name,
        formatAddr(invchead_shipto_address1, invchead_shipto_address2, invchead_shipto_address3, ( invchead_shipto_city || '  ' || invchead_shipto_state || ' ' || invchead_shipto_zipcode ), invchead_shipto_country) AS f_shiptoaddress,
        TEXT(invchead_ordernumber) AS ordernumber,
        invchead_ponumber,
        formatDate(invchead_orderdate) AS f_orderdate,
        formatDate(invchead_shipdate) AS f_shipdate,
        invchead_fob, terms_descrip, invchead_shipvia
 FROM remitto, cust, invchead
      LEFT OUTER JOIN terms ON (invchead_terms_id=terms_id)
 WHERE ( (invchead_cust_id=cust_id)
  AND (invchead_id=<? value("invchead_id") ?>) )
 ORDER BY ordernumber;
 --------------------------------------------------------------------

+QUERY: tracknum
+select cosmisc_tracknum from cohead, cosmisc, invchead
+where
+cohead_id = cosmisc_cohead_id
+and cohead_number = invchead_ordernumber
+and invchead_id = <? value("invchead_id") ?>;

 --------------------------------------------------------------------
 REPORT: PackingList
 QUERY: head
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
 	      'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
-       -- in 2.3: use the shipment info if we have one
        COALESCE(shiphead_shipvia, cohead_shipvia) AS shipvia,
        cohead_shiptophone AS shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments AS shipcomments,
        cohead_billtoname AS billtoname,
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2,
                   cohead_billtoaddress3,
                   (cohead_billtocity || '  ' ||   cohead_billtostate ||
                   '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
        cohead_shiptoname AS shiptoname,
        formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2,
                   cohead_shiptoaddress3,
                   (cohead_shiptocity || '  ' ||   cohead_shiptostate ||
                   '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,

        cust_number,
        cust_contact,
        cust_phone,
        terms_descrip
-  -- In 2.3: rearrange FROM and WHERE to use shiphead_id or order head_id, whichever we have
   FROM cust, terms, cohead
 <? if exists("shiphead_id") ?>
 	JOIN
 <? else ?>
 	LEFT OUTER JOIN
 <? endif ?>
        shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
 		AND (shiphead_order_id=cohead_id)
 		AND (shiphead_order_type='SO'))
  WHERE ((cohead_cust_id=cust_id)
    AND  (cohead_terms_id=terms_id)
 <? if exists("head_id") ?>
    AND  (<? value("head_type") ?>='SO')
    AND  (cohead_id=<? value("head_id") ?>)
 <? endif ?>
 )

 <? if exists("MultiWhs") ?>
 UNION
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
       'T/O #:' AS ordertype,
        tohead_number AS ordernumber,
        formattobarcode(tohead_id) AS order_barcode,
-       -- in 2.3: use the shipment info if we have one
        COALESCE(shiphead_shipvia, tohead_shipvia) AS shipvia,
        tohead_destphone AS shiptophone,
        TEXT(tohead_number) AS cohead_custponumber,
        formatDate(tohead_orderdate) AS orderdate,
        tohead_shipcomments AS shipcomments,
        '' AS billtoname,
        '' AS billing_address,
        tohead_destname AS shiptoname,
        formataddr(tohead_destaddress1, tohead_destaddress2,
                    tohead_destaddress3,
                   (tohead_destcity || ' ' || tohead_deststate ||
                    ' ' || tohead_destpostalcode), tohead_destcountry) AS shipping_address,
        'Transfer Order' AS cust_number,
        tohead_destcntct_name AS cust_contact,
        tohead_destphone AS cust_phone,
        '' AS terms_descrip
-  -- In 2.3: rearrange FROM and WHERE to use shiphead_id or order head_id, whichever we have
   FROM tohead
 <? if exists("shiphead_id") ?>
 	JOIN
 <? else ?>
 	LEFT OUTER JOIN
 <? endif ?>
        shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
 		AND (shiphead_order_id=tohead_id)
 		AND (shiphead_order_type='TO'))
 <? if exists("head_id") ?>
  WHERE ((<? value("head_type") ?>='TO')
    AND  (tohead_id=<? value("head_id") ?>)
    )
 <? endif ?>
 <? endif ?>;
 --------------------------------------------------------------------

 QUERY: scheddate
 SELECT formatDate(MIN(orderitem_scheddate)) AS scheddate
-  -- In 2.3: use orderitem view to get sched date regardless of order type
   FROM orderitem
-  -- In 2.3: use shiphead_id if we have it
        <? if exists("shiphead_id") ?>
        JOIN shiphead ON ((orderitem_orderhead_type=shiphead_order_type)
 		     AND (orderitem_orderhead_id=shiphead_order_id)
 		     AND (shiphead_id=<? value("shiphead_id")?>))
        JOIN shipitem ON ((shiphead_id=shipitem_shiphead_id)
 		     AND (shipitem_orderitem_id=orderitem_id))
        <? endif ?>
  WHERE ((orderitem_status <> 'X')
--- In 2.3: use order's head_id if we have it
 <? if exists("head_id") ?>
    AND  (orderitem_orderhead_type=<? value("head_type") ?>)
    AND  (orderitem_orderhead_id=<? value("head_id") ?>)
 <? endif ?>
  );
 --------------------------------------------------------------------

 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber AS linenumber,
        coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
---     In 2.3 replaced the next line:
---     uom_name,
---     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(coitem_qtyord) AS ordered,
-       -- In 2.3: use qtyAtShipping instead joining with the deprecated coship
-       formatQty(qtyAtShipping('SO', coitem_id)) AS atshipping,
+       formatQty(<? if exists("shiphead_id") ?>
+                 qtyInShipment('SO', coitem_id, <? value("shiphead_id") ?>)
+                 <? else ?> qtyAtShipping('SO', coitem_id) <? endif ?>
+                ) AS atshipping,

        formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END)) AS shipordered,
-       -- In 2.3: use qtyAtShipping instead joining with the deprecated coship
-       formatQty(roundUp(qtyAtShipping('SO', coitem_id) /
+       formatQty(roundUp(<? if exists("shiphead_id") ?>
+                 qtyInShipment('SO', coitem_id, <? value("shiphead_id") ?>)
+                 <? else ?> qtyAtShipping('SO', coitem_id) <? endif ?> /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END)) AS shipatshipping,

        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus
                                            FROM cust,cohead
                                           WHERE coitem_cohead_id=cohead_id
                                             AND cust_id=cohead_cust_id)='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=coitem_linenumber)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=coitem_linenumber)
                                              AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
             WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
                                          + qtyOrdered(itemsite_id, CURRENT_DATE))
                                           >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
             ELSE coitem_status
        END AS f_status
-  -- In 2.3: remove uses of the deprecated coship in FROM, WHERE, and GROUP BY
   FROM itemsite, item, coitem, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
--- In 2.3: use the shiphead_id if we have it and the order head_id if we have it
 <? if exists("shiphead_id") ?>
    AND  (coitem_cohead_id IN (SELECT shiphead_order_id FROM shiphead
 			      WHERE ((shiphead_id=<? value("shiphead_id") ?>)
 			        AND  (shiphead_order_type='SO'))))
 <? endif ?>
 <? if exists("head_id") ?>
    AND  (<? value("head_type") ?>='SO')
    AND  (coitem_cohead_id=<? value("head_id") ?>)
 <? endif ?>
 )
---2.3 add coitem_qty_uom_id, to the GROUP BY clause
 GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
        toitem_linenumber AS linenumber,
        '' AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,
-       -- In 2.3: use qtyAtShipping instead of joining with the shipitem table
-       formatQty(qtyAtShipping('TO', toitem_id)) AS atshipping,
-
+       formatQty(<? if exists("shiphead_id") ?>
+                 qtyInShipment('TO', toitem_id, <? value("shiphead_id") ?>)
+                 <? else ?> qtyAtShipping('TO', toitem_id) <? endif ?>
+                ) AS atshipping,
        formatQty(roundUp(toitem_qty_ordered /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipordered,
-       -- In 2.3: use qtyAtShipping instead of joining with the shipitem table
-       formatQty(roundUp(qtyAtShipping('TO', toitem_id) /
+       formatQty(roundUp(<? if exists("shiphead_id") ?>
+                         qtyInShipment('TO', toitem_id, <? value("shiphead_id")?>)
+                         <? else ?> qtyAtShipping('TO', toitem_id) <? endif ?>
+                         /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipatshipping,

        toitem_status AS f_status
   FROM itemsite, item, toitem, tohead, uom
-  -- In 2.3: remove uses of the shipitem and shiphead tables in FROM and WHERE
  WHERE ((toitem_item_id=item_id)
    AND  (item_inv_uom_id=uom_id)
    AND  (item_id=itemsite_item_id)
    AND  (toitem_tohead_id=tohead_id)
    AND  (toitem_status <> 'X')
    AND  (tohead_src_warehous_id=itemsite_warehous_id)
--- In 2.3: use the shiphead_id if we have it and the order head_id if we have it
 <? if exists("shiphead_id") ?>
    AND  (toitem_tohead_id IN (SELECT shiphead_order_id FROM shiphead
 			      WHERE ((shiphead_id=<? value("shiphead_id") ?>)
 			        AND  (shiphead_order_type='TO'))))
 <? endif ?>
 <? if exists("head_id") ?>
    AND  (<? value("head_type") ?>='TO')
    AND  (toitem_tohead_id=<? value("head_id") ?>)
 <? endif ?>
 )
 <? endif ?>
 ORDER BY linenumber;
 --------------------------------------------------------------------

 QUERY: lotdetail
-select distinct
-cosmisc_number,
-(cohead_number || '-' || coitem_linenumber) AS ordernumber,
+SELECT
+shiphead_number AS cosmisc_number,
+(orderhead_number || '-' || orderitem_linenumber) AS ordernumber,
 item_number,
-invdetail_lotserial,
-invdetail_qty * -1 AS lotqty,
-invhist_invqty as totalshipmentqty,
+formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
+SUM(invdetail_qty) * -1 AS lotqty,
+SUM(invhist_invqty) as totalshipmentqty,
 invhist_transtype,
-formatdate(invhist_transdate) AS invhistdate,
-formatdate(coship_transdate) AS shiptransdate
---comment_text,
---cmnttype_name
-
-
-from cosmisc, coship, cohead, coitem, itemsite, item, invhist, invdetail, lsdetail
-
---left outer join comment on (comment_source_id = lsdetail_id)
---left outer join cmnttype on (comment_cmnttype_id = cmnttype_id)
-
-where
-
-(
-
---(cmnttype_name = 'Calc_Date_Activity')
---AND
-
-(coship_cosmisc_id = <? value("cosmisc_id") ?>)
-AND
-(cohead_id = <? value("sohead_id") ?>)
-AND
-invdetail_lotserial = lsdetail_lotserial
-AND
-(cosmisc_id = coship_cosmisc_id)
-AND
-(formatdate(invhist_transdate) = formatdate(coship_transdate))
-AND
-(coship_coitem_id = coitem_id)
-AND
-(coitem_itemsite_id = itemsite_id)
-AND
-(item_id = itemsite_item_id)
-AND
-(invhist_ordnumber = (cohead_number || '-' || coitem_linenumber))
-AND
-(invhist_ordtype = 'SO')
-AND
-(invdetail_invhist_id = invhist_id)
-AND
-(invhist_transtype = 'SH')
+formatdate(MAX(invhist_transdate)) AS invhistdate,
+formatdate(MAX(shipitem_transdate)) AS shiptransdate
+FROM shiphead,shipitem,invhist,invdetail,orderhead,orderitem,itemsite,item
+WHERE ( (shiphead_id = <? value("cosmisc_id") ?> )
+AND (shipitem_shiphead_id=shiphead_id)
+AND (invhist_id=shipitem_invhist_id)
+AND (invdetail_invhist_id=invhist_id)
+AND (orderhead_type=shiphead_order_type)
+AND (orderhead_id=shiphead_order_id)
+AND (orderitem_orderhead_type=shiphead_order_type)
+AND (orderitem_id=shipitem_orderitem_id)
+AND (itemsite_id=orderitem_itemsite_id)
+AND (item_id=itemsite_item_id)
 )
-
+GROUP BY shiphead_number,orderhead_number,item_number,invdetail_ls_id,
+orderitem_linenumber,invhist_transtype
 ORDER BY ordernumber;

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
        pohead_agent_username AS username,
        pohead_comments,
        text(<? value("title") ?>) AS title
-  FROM pohead, vend, terms, addr, whsinfo
+ FROM pohead
+   LEFT OUTER JOIN terms ON (pohead_terms_id = terms_id),
+   vend, whsinfo
+   LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
  WHERE ((pohead_vend_id=vend_id)
    AND (pohead_warehous_id = warehous_id)
-   AND (pohead_terms_id = terms_id)
-   AND (warehous_addr_id = addr_id)
---   AND (pohead_id <> 9999))
    AND (pohead_id=<? value("pohead_id") ?>) );

 --------------------------------------------------------------------
 REPORT: QOHByLocation
 QUERY: detail
 SELECT itemloc_id, warehous_code, item_number, item_descrip1, item_descrip2,
-       itemloc_lotserial, uom_name, formatQty(itemloc_qty) AS f_qoh
+       formatlotserialnumber(itemloc_ls_id) AS itemloc_lotserial, uom_name, formatQty(itemloc_qty) AS f_qoh
 FROM itemloc, itemsite, warehous, item, uom
 WHERE ((itemloc_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (itemloc_location_id=<? value("location_id") ?>))

 UNION SELECT -1, warehous_code, item_number, item_descrip1, item_descrip2,
              'N/A', uom_name, formatQty(itemsite_qtyonhand)
 FROM itemsite, warehous, item, uom
 WHERE ((itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (NOT itemsite_loccntrl)
  AND (itemsite_location_id=<? value("location_id") ?>))

 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: SummarizedSalesByCustomerType
 QUERY: detail
 SELECT custtype_id, custtype_code, warehous_code,
        formatPrice(minprice) AS f_minprice,
        formatPrice(maxprice) AS f_maxprice,
        formatPrice(avgprice) AS f_avgprice,
        formatQty(totalunits) AS f_totalunits,
        totalsales, formatMoney(totalsales) AS f_totalsales
 FROM ( SELECT custtype_id, custtype_code, warehous_code,
-              MIN(cohist_unitprice) AS minprice, MAX(cohist_unitprice) AS maxprice,
-              AVG(cohist_unitprice) AS avgprice, SUM(cohist_qtyshipped) AS totalunits,
-              SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS totalsales
+              MIN(currToBase(COALESCE(cohist_curr_id, baseCurrId()), cohist_unitprice, cohist_invcdate)) AS minprice,
+              MAX(currToBase(COALESCE(cohist_curr_id, baseCurrId()), cohist_unitprice, cohist_invcdate)) AS maxprice,
+              AVG(currToBase(COALESCE(cohist_curr_id, baseCurrId()), cohist_unitprice, cohist_invcdate)) AS avgprice,
+              SUM(currToBase(COALESCE(cohist_curr_id, baseCurrId()), cohist_qtyshipped, cohist_invcdate)) AS totalunits,
+              SUM(currToBase(COALESCE(cohist_curr_id, baseCurrId()), round(cohist_qtyshipped * cohist_unitprice,2), cohist_invcdate)) AS totalsales
        FROM cohist, cust, custtype, itemsite, item, warehous
        WHERE ( (cohist_cust_id=cust_id)
         AND (cust_custtype_id=custtype_id)
         AND (cohist_itemsite_id=itemsite_id)
         AND (itemsite_item_id=item_id)
         AND (itemsite_warehous_id=warehous_id)
         AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
         AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
         AND (custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
         AND (custtype_code ~ <? value("custtype_pattern") ?>)
 <? endif ?>
      )
 GROUP BY custtype_id, custtype_code, warehous_code ) AS data
 ORDER BY custtype_code, warehous_code;
 --------------------------------------------------------------------