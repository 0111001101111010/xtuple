--------------------------------------------------------------------
NEW REPORTS:
CheckMultiPage
--------------------------------------------------------------------
CHANGED REPORTS:
CheckRegister
CostedSingleLevelBOM
Invoice
PackingList-Shipment
PackingList
PurchaseOrder
Quote
VendorAPHistory
ViewAPCheckRunEditList
WOScheduleByParameterList

 
 --------------------------------------------------------------------
 REPORT: CheckRegister
 QUERY: head
 SELECT bankaccnt_name,
        bankaccnt_descrip,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        curr_symbol
   FROM bankaccnt, curr_symbol
  WHERE ((bankaccnt_id=<? value("bankaccnt_id") ?>)
    AND  (bankaccnt_curr_id = curr_id));
 --------------------------------------------------------------------
   
 QUERY: detail
-SELECT checkhead_id AS checkheadid,
+SELECT checkhead_id AS checkid,
+       CASE WHEN(checkhead_void) THEN -1
+            WHEN(checkhead_posted) THEN 1
+            ELSE 0
+       END AS extra,
+       -1 AS checkitem_id,
        formatBoolYN(checkhead_void) AS f_void,
        formatBoolYN(checkhead_misc) AS f_misc,
        formatBoolYN(checkhead_printed) AS f_printed,
        formatBoolYN(checkhead_posted) AS f_posted,
-       TEXT(checkhead_number) AS number,
-       (checkrrecip_number || '-' || checkrrecip_name) AS description,
+       CASE when checkhead_number = -1 THEN
+         'Unspecified'
+       ELSE TEXT(checkhead_number) END AS number,
+       COALESCE(checkrecip_number || '-' || checkrecip_name,
+		checkhead_recip_type || '-' || checkhead_recip_id ) AS description,
        formatDate(checkhead_checkdate) AS f_checkdate,
-       currToCurr(checkhead_curr_id, bankaccnt_curr_id, checkhead_amount, checkhead_checkdate) AS checkhead_amount_bankcurr,
        formatMoney(checkhead_amount) AS f_amount,
-       curr_symbol as currAbbr
-  FROM checkhead, checkrecip, curr_symbol, bankaccnt
- WHERE ( (checkhead_recip_id=checkrecip_id)
-   AND   (checkhead_recip_type=checkrecip_type)
+       currConcat(checkhead_curr_id) AS currAbbr,
+       checkhead_number,
+       1 AS orderby
+  FROM checkhead LEFT OUTER JOIN
+       checkrecip ON ((checkhead_recip_id=checkrecip_id)
+		 AND  (checkhead_recip_type=checkrecip_type))
+ WHERE ((checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
+<? if exists("showDetail") ?>
+UNION
+SELECT checkitem_checkhead_id AS checkid, 0 AS extra, checkitem_id,
+       '' AS f_void, '' AS f_misc, '' AS f_printed, '' AS f_posted,
+       checkitem_vouchernumber AS number,
+       checkitem_invcnumber AS description,
+       '' AS f_checkdate,
+       formatMoney(checkitem_amount) AS f_amount,
+       currConcat(checkitem_curr_id) AS currAbbr, 
+       checkhead_number, 
+       2 AS orderby 
+  FROM checkitem, checkhead 
+ WHERE ( (checkitem_checkhead_id=checkhead_id)
    AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
-   AND   (checkhead_bankaccnt_id=bankaccnt_id)
-   AND   (checkhead_curr_id = curr_id) )
-ORDER BY checkhead_number
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
+<? endif ?>
+ ORDER BY checkhead_number, checkid, orderby;
 --------------------------------------------------------------------
   
 QUERY: total
 SELECT formatMoney(SUM(currToCurr(checkhead_curr_id, bankaccnt_curr_id, checkhead_amount, checkhead_checkdate))) AS f_amount,
        currConcat(bankaccnt_curr_id) AS currAbbr
   FROM checkhead, checkrecip, bankaccnt
  WHERE ( (checkhead_recip_id=checkrecip_id)
    AND   (checkhead_recip_type=checkrecip_type)
    AND   (NOT checkhead_void)
    AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND   (checkhead_bankaccnt_id=bankaccnt_id)
    AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
 GROUP BY bankaccnt_curr_id;
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: CostedSingleLevelBOM
 QUERY: head
 SELECT item_number,
        item_invuom,
        item_descrip1,
        item_descrip2,
        formatCost(stdcost(item_id)) AS standardcost,
        formatCost(actcost(item_id)) AS actualcost,
        <? if exists("useActualCosts") ?>
          text('Actual Cost')
        <? else ?>
          text('Standard Cost')
        <? endif ?>
        AS costtype
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
     
 --------------------------------------------------------------------
   
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
   bomdata_qtyper AS qtyper,
   bomdata_scrap AS scrap,
-  formatqtyper(bomitem_qtyper * (1 + bomitem_scrap) * itemuomtouomratio(bomitem_item_id,bomitem_uom_id,item_inv_uom_id)) AS qtyreq,
+  CASE
+    WHEN item_inv_uom_id IS NOT NULL THEN
+      formatqtyper(bomitem_qtyper * (1 + bomitem_scrap) * itemuomtouomratio(bomitem_item_id,bomitem_uom_id,item_inv_uom_id)) 
+    ELSE
+      ''
+  END AS qtyreq,
   bomdata_effective AS effective,
   bomdata_expires AS expires,
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
-  LEFT OUTER JOIN bomitem ON (bomdata_bomitem_id=bomitem_id),
-  item
-WHERE (bomitem_item_id=item_id)
+  LEFT OUTER JOIN bomitem ON (bomdata_bomitem_id=bomitem_id)
+  LEFT OUTER JOIN item ON (bomitem_item_id=item_id)
 ORDER BY orderby;
     
 --------------------------------------------------------------------
   
 QUERY: bomhead
 SELECT bomhead_docnum, bomhead_revision,
 formatDate(bomhead_revisiondate) AS f_revisiondate
 FROM bomhead
 WHERE ((bomhead_item_id=<? value("item_id") ?>)
 AND (bomhead_rev_id=<? value("revision_id") ?>));
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: GroupHead
 SELECT remitto.*,
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
   
 QUERY: Detail
 SELECT invcitem_linenumber,
        formatQty(invcitem_billed) AS f_billed,
---     In 2.3 replaced the next line:
---     uom_name AS invuom,
---     with:
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
             ELSE itemalias_descrip2
        END AS descrip2,
        formatPrice(invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
        formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) AS f_extprice,
        invcitem_notes,
        getInvcitemLotSerial(invcitem_id) AS lotserial,
        characteristicsToString('SI', (SELECT coitem_id FROM coitem, cohead, invchead WHERE (cohead_number=invchead_ordernumber and invchead_id=<? value("invchead_id") ?> and coitem_cohead_id=cohead_id and coitem_linenumber=invcitem_linenumber)), '=', ', ') AS coitem_characteristics
 FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;
 --------------------------------------------------------------------
   
 QUERY: foot
 SELECT formatMoney(SUM(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2))) AS f_extprice
 FROM invcitem LEFT OUTER JOIN item on (invcitem_item_id=item_id)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: GroupExtended
 SELECT formatMoney( noNeg(invchead_freight + invchead_misc_amount + invchead_tax +
                        ( SELECT COALESCE(SUM(round(((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1))),2)), 0)
                          FROM invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id)
                          WHERE (invcitem_invchead_id=<? value("invchead_id") ?>) )
                     - total_allocated) ) AS f_totaldue,
        formatMoney(invchead_misc_amount) AS f_misc,
        formatMoney(invchead_tax) AS f_tax,
        formatMoney(invchead_freight) AS f_freight,
        formatMoney(invchead_payment) AS f_payment,
        formatMoney(total_allocated) AS f_allocated,
        invchead_notes,
        invchead_misc_descrip
 FROM invchead,
 (SELECT COALESCE(SUM(CASE WHEN((aropen_amount - aropen_paid) >=
 			        currToCurr(aropenco_curr_id, aropen_curr_id,
 					   aropenco_amount, aropen_docdate))
 		THEN currToCurr(aropenco_curr_id, invchead_curr_id,
 				aropenco_amount, aropen_docdate)
 		ELSE currToCurr(aropen_curr_id, invchead_curr_id,
 				aropen_amount - aropen_paid, aropen_docdate)
 	    END),0) AS total_allocated
   FROM aropenco, aropen, cohead, invchead
  WHERE ( (aropenco_aropen_id=aropen_id)
    AND   (aropenco_cohead_id=cohead_id)
    AND   ((aropen_amount - aropen_paid) > 0)
    AND   (cohead_number=invchead_ordernumber)
-   AND   (invchead_id=<? value("invchead_id") ?>) )) AS totalalloc
-WHERE (invchead_id=<? value("invchead_id") ?>);
+   AND   (NOT invchead_posted)
+   AND   (invchead_id=<? value("invchead_id") ?>) )
+ UNION
+SELECT COALESCE(SUM(currToCurr(arapply_curr_id, t.aropen_curr_id,
+                               arapply_applied, t.aropen_docdate)),0) AS total_allocated
+  FROM arapply, aropen s, aropen t, invchead
+ WHERE ( (s.aropen_id=arapply_source_aropen_id)
+   AND   (arapply_target_aropen_id=t.aropen_id)
+   AND   (arapply_target_doctype='I')
+   AND   (arapply_target_docnumber=invchead_invcnumber)
+   AND   (arapply_source_aropen_id=s.aropen_id)
+   AND   (invchead_posted)
+   AND   (invchead_id=<? value("invchead_id") ?>) )
+ -- there will be two rows, one each for posted and not. get the greater of the two
+ -- as at least one is guaranteed to be 0
+ORDER BY total_allocated DESC ) AS totalalloc
+WHERE (invchead_id=<? value("invchead_id") ?>)
+;
 --------------------------------------------------------------------
   
 QUERY: allocatedCMs
-SELECT cohead_id, aropen_id,
+SELECT cohead_id,
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
-            ELSE currToCurr(aropen_curr_id, invchead_curr_id, aropen_amount - aropen_paid, aropen_docdate)
+            ELSE currToCurr(aropen_curr_id, invchead_curr_id,
+                            aropen_amount - aropen_paid, aropen_docdate)
        END AS allocated_invccurr,
        CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN formatMoney(currToCurr(aropenco_curr_id, invchead_curr_id,
 					aropenco_amount, aropen_docdate))
-            ELSE formatMoney(currToCurr(aropen_curr_id, invchead_curr_id, aropen_amount - aropen_paid, aropen_docdate))
+            ELSE formatMoney(currToCurr(aropen_curr_id, invchead_curr_id,
+                                        aropen_amount - aropen_paid,
+                                        aropen_docdate))
        END AS f_allocated_invccurr,
        curr_symbol AS aropen_currsymbol
   FROM aropenco, aropen, cohead, invchead, curr_symbol
  WHERE ( (aropenco_aropen_id=aropen_id)
    AND   (aropenco_cohead_id=cohead_id)
    AND   ((aropen_amount - aropen_paid) > 0)
    AND   (aropen_curr_id=curr_id)
    AND   (cohead_number=invchead_ordernumber)
-   AND   (invchead_id=<? value("invchead_id") ?>) );
+   AND   (NOT invchead_posted)
+   AND   (invchead_id=<? value("invchead_id") ?>) )
+UNION
+SELECT cohead_id,
+       arapply_source_docnumber AS aropen_docnumber,
+       formatMoney(s.aropen_amount) AS f_total,
+       formatMoney(s.aropen_paid -
+                   currToCurr(arapply_curr_id, s.aropen_curr_id,
+                              arapply_applied, arapply_postdate)) AS f_paid,
+       formatMoney(s.aropen_amount - s.aropen_paid +
+                   currToCurr(arapply_curr_id, s.aropen_curr_id,
+                              arapply_applied, arapply_postdate)) AS f_balance,
+       currToCurr(arapply_curr_id, s.aropen_curr_id,
+                  arapply_applied, arapply_postdate) AS allocated,
+       formatMoney(currToCurr(arapply_curr_id, s.aropen_curr_id,
+                              arapply_applied,
+                              arapply_postdate)) AS f_allocated,
+       currToCurr(arapply_curr_id, invchead_curr_id,
+                  arapply_applied, t.aropen_docdate) AS allocated_invccurr,
+       formatMoney(currToCurr(arapply_curr_id, invchead_curr_id,
+                              arapply_applied,
+                              t.aropen_docdate)) AS f_allocated_invccurr,
+       curr_symbol AS aropen_currsymbol
+  FROM arapply, aropen s, aropen t, cohead, invchead, curr_symbol
+ WHERE ( (s.aropen_id=arapply_source_aropen_id)
+   AND   (arapply_target_aropen_id=t.aropen_id)
+   AND   (arapply_target_doctype='I')
+   AND   (arapply_target_docnumber=invchead_invcnumber)
+   AND   (arapply_source_aropen_id=s.aropen_id)
+   AND   (arapply_curr_id=curr_id)
+   AND   (cohead_number=invchead_ordernumber)
+   AND   (invchead_posted)
+   AND   (invchead_id=<? value("invchead_id") ?>) )
+ ORDER BY aropen_docnumber;
 --------------------------------------------------------------------
   
 QUERY: currency
 SELECT
  curr_symbol
 FROM
     invchead,
     curr_symbol
 WHERE (invchead_id = <? value("invchead_id") ?>) AND
       invchead_curr_id = curr_id;
 --------------------------------------------------------------------
   
 QUERY: logo
 SELECT image_data 
 FROM image 
 WHERE ((image_name='logo'));
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: head
 SELECT shiphead_number, 'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
        cohead_shipvia AS shipvia,
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
   FROM shiphead, cohead, cust, terms
  WHERE ((cohead_cust_id=cust_id)
    AND (cohead_terms_id=terms_id)
    AND (cohead_id=shiphead_order_id)
    AND (shiphead_order_type='SO')
    AND (shiphead_id=<? value("shiphead_id") ?>)
 )
 <? if exists("MultiWhs") ?>
 UNION
 SELECT shiphead_number, 'T/O #:' AS ordertype,
        tohead_number AS ordernumber,
        formattobarcode(tohead_id) AS order_barcode,
        shiphead_shipvia AS shipvia,
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
   FROM shiphead, tohead
  WHERE ((tohead_id=shiphead_order_id)
    AND  (shiphead_order_type='TO')
    AND  (shiphead_id=<? value("shiphead_id") ?>)
 )
 <? endif ?>;
 --------------------------------------------------------------------
   
 QUERY: scheddate
 SELECT formatDate(MIN(coitem_scheddate)) AS scheddate
   FROM coitem, coship
  WHERE ((coitem_status <> 'X')
    AND  (coitem_id=coship_coitem_id)
    AND  (coship_cosmisc_id=<? value("coship_cosmisc_id") ?>));
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber AS linenumber,
        coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,
 
        formatQty(coitem_qtyord) AS ordered,
-       formatQty(coship_qty) AS atshipping,
+       formatQty(coship_qty) AS shipped,
 
        formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END)) AS shipordered,
        formatQty(roundUp(coship_qty /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END ) ) AS shipatshipping,
 
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
-       END AS f_status
+       END AS f_status,
+       CASE
+         WHEN (getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) = '') THEN
+           ''
+         ELSE
+           'Serial #/Lot Information:'
+       END AS lotserial_title,
+       getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) AS lotserial,
+       CASE
+         WHEN (getPacklistCharName(coship_cosmisc_id, coitem_id) = '') THEN
+           ''
+         ELSE
+           'Characteristics:'
+       END AS char_title,
+       getPacklistCharName(coship_cosmisc_id, coitem_id) AS char_name,
+       getPacklistCharValue(coship_cosmisc_id, coitem_id) AS char_value
   FROM itemsite, item, coitem, coship, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_id=coship_coitem_id)
    AND (coship_cosmisc_id=<? value("cosmisc_id") ?>)
 )
---2.3 add coitem_qty_uom_id, to the GROUP BY clause
-GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
-         coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
-         itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id, coship_qty
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
-       formatQty(shipitem_qty) AS atshipping,
+       formatQty(shipitem_qty) AS shipped,
 
        formatQty(roundUp(toitem_qty_ordered /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipordered,
        formatQty(roundUp(shipitem_qty /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipatshipping,
 
-       toitem_status AS f_status
+       toitem_status AS f_status,
+       CASE
+         WHEN (getPacklistItemLotSerial(shiphead_id, toitem_id) = '') THEN
+           ''
+         ELSE
+           'Serial #/Lot Information:'
+       END AS lotserial_title,
+       getPacklistItemLotSerial(shiphead_id, toitem_id) AS lotserial,
+       '' AS char_title,
+       '' AS char_name,
+       '' AS char_value
   FROM itemsite, item, toitem, tohead, shipitem, shiphead, uom
  WHERE ((toitem_item_id=item_id)
    AND  (item_inv_uom_id=uom_id)
    AND  (item_id=itemsite_item_id)
    AND  (toitem_tohead_id=tohead_id)
    AND  (toitem_status <> 'X')
    AND  (tohead_src_warehous_id=itemsite_warehous_id)
    AND  (toitem_id=shipitem_orderitem_id)
    AND  (shipitem_shiphead_id=shiphead_id)
    AND  (shiphead_order_type='TO')
    AND  (shiphead_id=<? value("shiphead_id") ?>)
 )
 <? endif ?>
 ORDER BY linenumber;
 --------------------------------------------------------------------
   
 QUERY: logo
 SELECT image_data 
 FROM image 
 WHERE ((image_name='logo'));
 --------------------------------------------------------------------
   
 QUERY: so_ra_relation
 --added in 2.3 to show RA link to S/O if the SO
 --was created as the result of a replacement RA
 select 
 'RA #' AS ratext,
 rahead_number
 from
 rahead, cohead, shiphead
 where 
 rahead_new_cohead_id = cohead_id
 and cohead_id = shiphead_order_id
 and shiphead_id = <? value("shiphead_id") ?>;
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: PackingList
 QUERY: head
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
 	      'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
        -- in 2.3: use the shipment info if we have one
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
   -- In 2.3: rearrange FROM and WHERE to use shiphead_id or order head_id, whichever we have
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
        -- in 2.3: use the shipment info if we have one
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
   -- In 2.3: rearrange FROM and WHERE to use shiphead_id or order head_id, whichever we have
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
   -- In 2.3: use orderitem view to get sched date regardless of order type
   FROM orderitem
   -- In 2.3: use shiphead_id if we have it
        <? if exists("shiphead_id") ?>
        JOIN shiphead ON ((orderitem_orderhead_type=shiphead_order_type)
 		     AND (orderitem_orderhead_id=shiphead_order_id)
 		     AND (shiphead_id=<? value("shiphead_id")?>))
        JOIN shipitem ON ((shiphead_id=shipitem_shiphead_id)
 		     AND (shipitem_orderitem_id=orderitem_id))
        <? endif ?>
  WHERE ((orderitem_status <> 'X')
 -- In 2.3: use order's head_id if we have it
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
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,
 
        formatQty(coitem_qtyord) AS ordered,
        -- In 2.3: use qtyAtShipping instead joining with the deprecated coship
        formatQty(qtyAtShipping('SO', coitem_id)) AS atshipping,
 
        formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END)) AS shipordered,
        -- In 2.3: use qtyAtShipping instead joining with the deprecated coship
        formatQty(roundUp(qtyAtShipping('SO', coitem_id) /
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
   -- In 2.3: remove uses of the deprecated coship in FROM, WHERE, and GROUP BY
   FROM itemsite, item, coitem, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
 -- In 2.3: use the shiphead_id if we have it and the order head_id if we have it
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
 --2.3 add coitem_qty_uom_id, to the GROUP BY clause
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
        -- In 2.3: use qtyAtShipping instead of joining with the shipitem table
        formatQty(qtyAtShipping('TO', toitem_id)) AS atshipping,
 
        formatQty(roundUp(toitem_qty_ordered /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipordered,
        -- In 2.3: use qtyAtShipping instead of joining with the shipitem table
        formatQty(roundUp(qtyAtShipping('TO', toitem_id) /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipatshipping,
 
        toitem_status AS f_status
   FROM itemsite, item, toitem, tohead, uom
   -- In 2.3: remove uses of the shipitem and shiphead tables in FROM and WHERE
  WHERE ((toitem_item_id=item_id)
    AND  (item_inv_uom_id=uom_id)
    AND  (item_id=itemsite_item_id)
    AND  (toitem_tohead_id=tohead_id)
    AND  (toitem_status <> 'X')
    AND  (tohead_src_warehous_id=itemsite_warehous_id)
 -- In 2.3: use the shiphead_id if we have it and the order head_id if we have it
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
   
 QUERY: logo
 SELECT image_data 
 FROM image 
 WHERE ((image_name='logo'));
 --------------------------------------------------------------------
   
+QUERY: lotdetail
+select distinct
+cosmisc_number,
+(cohead_number || '-' || coitem_linenumber) AS ordernumber,
+item_number,
+invdetail_lotserial,
+invdetail_qty * -1 AS lotqty,
+invhist_invqty as totalshipmentqty,
+invhist_transtype,
+formatdate(invhist_transdate) AS invhistdate,
+formatdate(coship_transdate) AS shiptransdate
+--comment_text,
+--cmnttype_name
+
+
+from cosmisc, coship, cohead, coitem, itemsite, item, invhist, invdetail, lsdetail
+
+--left outer join comment on (comment_source_id = lsdetail_id)
+--left outer join cmnttype on (comment_cmnttype_id = cmnttype_id) 
+
+where 
+
+(
+
+--(cmnttype_name = 'Calc_Date_Activity')
+--AND
+
+(coship_cosmisc_id = <? value("cosmisc_id") ?>)
+AND
+(cohead_id = <? value("sohead_id") ?>)
+AND
+invdetail_lotserial = lsdetail_lotserial
+AND
+(cosmisc_id = coship_cosmisc_id)
+AND
+(formatdate(invhist_transdate) = formatdate(coship_transdate)) 
+AND 
+(coship_coitem_id = coitem_id)
+AND
+(coitem_itemsite_id = itemsite_id)
+AND
+(item_id = itemsite_item_id)
+AND
+(invhist_ordnumber = (cohead_number || '-' || coitem_linenumber))
+AND
+(invhist_ordtype = 'SO')
+AND
+(invdetail_invhist_id = invhist_id)
+AND
+(invhist_transtype = 'SH')
+)
+
+ORDER BY ordernumber;
+--------------------------------------------------------------------
+  
 
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
   FROM pohead, vend, terms, addr, whsinfo
  WHERE ((pohead_vend_id=vend_id)
    AND (pohead_warehous_id = warehous_id)
    AND (pohead_terms_id = terms_id)
    AND (warehous_addr_id = addr_id)
 --   AND (pohead_id <> 9999))
    AND (pohead_id=<? value("pohead_id") ?>) );
 --------------------------------------------------------------------
   
 QUERY: Detail
 SELECT poitem_linenumber,
        poitem_comments,
        poitem_linenumber AS f_line,
        item_number,
        poitem_vend_item_number,
 --The Case statement below filters out TABs that a user may have inadvertently put in the Vend Desc field
 --MDA v 2.1    
        CASE WHEN (LENGTH(TRIM(BOTH '	' FROM poitem_vend_item_descrip)) <= 0) THEN
           (item_descrip1 || '' || item_descrip2)
        ELSE (poitem_vend_item_descrip)
        END AS itemdescription,
        formatQty(poitem_qty_ordered) AS f_ordered,
        CASE WHEN (poitem_vend_uom LIKE '') THEN (uom_name)
             ELSE (poitem_vend_uom)
        END AS itemuom,
        formatPrice(poitem_unitprice) AS f_price,
        formatExtPrice(poitem_unitprice * poitem_qty_ordered) AS f_extended,
        formatDate(poitem_duedate) AS f_duedate,
        characteristicsToString('PI', poitem_id, '=', ', ') AS poitem_characteristics
 FROM poitem
 	LEFT OUTER JOIN itemsite ON (poitem_itemsite_id = itemsite_id)
 	LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (itemsite_item_id = item_id)
 WHERE 	(poitem_pohead_id=<? value("pohead_id") ?>) 
 ORDER BY poitem_linenumber;
 --------------------------------------------------------------------
   
 QUERY: Foot
 SELECT formatExtPrice(COALESCE(SUM(poitem_qty_ordered * poitem_unitprice), 0)) AS f_subtotal,
        formatExtPrice(COALESCE(SUM(poitem_freight)+pohead_freight,0)) AS f_totalfreight,
        formatExtPrice(COALESCE(pohead_tax,0)) AS f_tax,
        formatExtPrice(COALESCE(SUM(poitem_qty_ordered * poitem_unitprice), 0)+COALESCE(SUM(poitem_freight)+pohead_freight,0)+COALESCE(pohead_tax,0)) AS f_totaldue
   FROM poitem, pohead
  WHERE ( (poitem_pohead_id=<? value("pohead_id") ?>)
   AND (pohead_id=poitem_pohead_id) )
  GROUP BY pohead_freight, pohead_tax;
 --------------------------------------------------------------------
   
 QUERY: Logo
 SELECT image_data 
 FROM image 
 WHERE ((image_name='logo'));
 --------------------------------------------------------------------
   
 QUERY: Currency
 SELECT
  curr_symbol
 FROM
     pohead,
     curr_symbol
 WHERE (pohead_id = <? value("pohead_id") ?>) AND
       pohead_curr_id = curr_id;
 --------------------------------------------------------------------
   
+QUERY: Address
+SELECT
+     warehous_descrip,
+     formatAddr(addr_line1, addr_line2, addr_line3, ( addr_city || '  ' || addr_state || '  ' || addr_postalcode), addr_country) AS warehouse_address
+FROM
+     whsinfo, 
+     addr, 
+     pohead
+WHERE 
+     addr_id = warehous_addr_id
+     and pohead_warehous_id = warehous_id
+     AND pohead_id=<? value("pohead_id") ?> ;
+--------------------------------------------------------------------
+  
 
 --------------------------------------------------------------------
 REPORT: Quote
 QUERY: head
 SELECT quhead_number,
+       quhead_shipvia,
        formatDate(quhead_quotedate) as f_orderdate,
        formatDate(quhead_packdate) as f_packdate,
        CASE WHEN(quhead_origin='C') THEN 'Customer'
             WHEN(quhead_origin='I') THEN 'Internet'
             WHEN(quhead_origin='S') THEN 'Sales Rep.'
             ELSE quhead_origin
        END AS f_origin,
         salesrep_name,
        formatScrap(quhead_commission) as f_commission,
         (tax_code||' - '||tax_descrip) as f_tax,
         (terms_code||' - '||terms_descrip) as f_terms,
        cust_number,
        quhead_billtoname,
        formatAddr(quhead_billtoaddress1, quhead_billtoaddress2, quhead_billtoaddress3, (quhead_billtocity||', '||quhead_billtostate||' '||quhead_billtozip), quhead_billtocountry) AS f_billtoaddress,
        
        CASE WHEN(quhead_shipto_id=-1) THEN text('')
             ELSE (select text(shipto_num) from shipto where shipto_id=quhead_shipto_id)
        END AS f_shiptonum,
 
        quhead_shiptoname,
        formatAddr(quhead_shiptoaddress1, quhead_shiptoaddress2, quhead_shiptoaddress3, (quhead_shiptocity||', '||quhead_shiptostate||' '||quhead_shiptozipcode), quhead_shiptocountry) AS f_shiptoaddress,
        quhead_custponumber,
        quhead_fob
 --For 2.1  the structure related to TAX and CRM and Quotes for PROSPECTS 
 --has changed and the FROM and WHERE clauses should be
 --changed as follows:
 --Start:
     FROM quhead
          LEFT OUTER JOIN cust ON (quhead_cust_id = cust_id)
 	LEFT OUTER JOIN terms ON (quhead_terms_id = terms_id)
          LEFT OUTER JOIN salesrep ON (quhead_salesrep_id = salesrep_id)
          LEFT OUTER JOIN tax ON (quhead_tax_id = tax_id)
     WHERE (quhead_id = <? value("quhead_id") ?>)
 --End
 
 --  Previous FROM and WHERE clauses:
 --  FROM quhead, terms, salesrep, cust
 --     AND  (quhead_cust_id=cust_id))
 --     AND  (quhead_salesrep_id=salesrep_id))
 --     AND  (quhead_tax_id=tax_id)
 --     AND  (quhead_terms_id=terms_id) );
 --------------------------------------------------------------------
   
 QUERY: notes
 SELECT quhead_ordercomments,
        quhead_shipcomments
   FROM quhead
  WHERE (quhead_id=<? value("quhead_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: items
 SELECT 
---The following 2 lines are new in 2.3
-       (select uom_name from uom where uom_id = quitem_qty_uom_id) AS uom_ordered,
-       (select uom_name from uom where uom_id = quitem_price_uom_id) AS uom_pricing,
+       
        quitem_id,
        quitem_linenumber,
        item_number,
        item_descrip1,
+       --The following 2 lines are new in 2.3
+       (select uom_name from uom where uom_id = quitem_qty_uom_id) AS uom_ordered,
+       (select uom_name from uom where uom_id = quitem_price_uom_id) AS uom_pricing,
        warehous_code,
        formatQty(quitem_qtyord) as f_ordered,
        formatPrice(quitem_price) as f_price,
---The following line was changed in 2.3 from:
---       formatExtprice(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) as f_extprice
---To:
-       formatExtprice((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) as f_extprice
-  FROM item, quitem LEFT OUTER JOIN (itemsite JOIN warehous ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
- WHERE ( (quitem_item_id=item_id)
--- AND   (quitem_quhead_id='122') )
-   AND   (quitem_quhead_id=<? value("quhead_id") ?>) )
- ORDER BY quitem_linenumber;
+       --The following line was changed in 2.3 from:
+       --formatExtprice(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) as f_extprice
+       --To:
+       formatExtprice((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) as f_extprice,
+       quitem_memo,
+       char_name, 
+       charass_value 
+FROM 
+     item, 
+     quitem
+     LEFT OUTER JOIN (itemsite JOIN warehous ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
+     LEFT OUTER JOIN charass on (charass_target_id = quitem_id) left outer join char ON (charass_char_id = char_id)
+WHERE 
+( 
+     (quitem_item_id=item_id)
+     AND (quitem_quhead_id=<? value("quhead_id") ?>) 
+)
+ORDER BY quitem_linenumber;
 --------------------------------------------------------------------
   
 QUERY: totals
 SELECT 1 as one,
        formatExtPrice(subtotal) AS f_subtotal,
        formatExtPrice(tax) AS f_tax,
        formatExtPrice(quhead_freight) as f_freight,
        formatExtPrice(subtotal + tax + quhead_freight) AS f_total
   FROM quhead,
        (SELECT SUM(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) AS subtotal
           FROM quitem, item
          WHERE ((quitem_quhead_id=<? value("quhead_id") ?>)
            AND  (quitem_item_id=item_id)) ) AS subtot,
        (SELECT calculateTax(quhead_tax_id,
                             SUM(quitem_qtyord
                               * (quitem_price
                               / iteminvpricerat(item_id))),
                             quhead_freight) AS tax
           FROM quitem, item,
                (SELECT quhead_tax_id,
                        quhead_freight
                   FROM quhead
                  WHERE (quhead_id=<? value("quhead_id") ?>) ) as data
          WHERE ((quitem_quhead_id=<? value("quhead_id") ?>)
            AND  (quitem_item_id=item_id))
       GROUP BY quhead_tax_id, quhead_freight ) as taxinfo
  WHERE (quhead_id=<? value("quhead_id") ?>);
 
 
 --------------------------------------------------------------------
   
 QUERY: GroupFoot
 --Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
 --with quitem_price_invuomratio:
 SELECT formatMoney(SUM(round((quitem_price * quitem_qty_invuomratio) * quitem_qtyord / quitem_price_invuomratio ,2))) AS f_extprice,
        formatMoney(quhead_freight) AS f_freight,
        formatMoney(quhead_misc) AS f_misc,
 
 -- Old way of calculating Tax:       
 --formatMoney(calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / iteminvpricerat(item_id) ,2)), quhead_freight, 'T')) AS f_tax,
 --
 -- New way after 2.1.1:
 formatMoney((select 
 ((
 
 --Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
 --with quitem_price_invuomratio:
 select sum(calculatetax(quitem_tax_id, (quitem_qtyord * (quitem_price * quitem_qty_invuomratio) / quitem_price_invuomratio), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'A') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'B') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'C') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 ))) AS f_tax,
 --End of new 2.1.1 Tax Calc
 
 --Note: in 2.1.1 replace Tax Calc with new method in the section 
 --of the query that returns f_totaldue:
 --Old f_total due START:
 --formatMoney((calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / --iteminvpricerat(item_id) ,2)), quhead_freight, 'T')) + SUM(round(quitem_price * quitem_qtyord / iteminvpricerat(item_id) ,2)) + quhead_freight + --quhead_misc) as f_totaldue
 --Old f_totaldue END
 
 ------------------------------------
 --New f_totaldue begin:
 
 formatMoney(
 (
 --Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
 --with quitem_price_invuomratio:
 select sum(calculatetax(quitem_tax_id, (quitem_qtyord * (quitem_price * quitem_qty_invuomratio) / quitem_price_invuomratio), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'A') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'B') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'C') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 --Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
 --with quitem_price_invuomratio:
  + SUM(round((quitem_price * quitem_qty_invuomratio) * quitem_qtyord / quitem_price_invuomratio ,2)) 
  + quhead_freight 
  + quhead_misc) 
 AS f_totaldue
 
 --New f_totaldue end:
 ------------------------------------
 
 FROM quhead, quitem, item
 
 WHERE ( (quitem_quhead_id=quhead_id)
  AND (quitem_item_id=item_id)
  AND (quhead_id=<? value("quhead_id") ?>) )
 GROUP BY quhead_id, quhead_freight, quhead_tax_id, quhead_misc;
 --------------------------------------------------------------------
   
 QUERY: logo
 SELECT image_data 
 FROM image 
 WHERE ((image_name='logo'));
 --------------------------------------------------------------------
   
 QUERY: currency_info
 --this was added in version 2.3
 select 
 curr_name,
 curr_symbol,
 curr_abbr
  from quhead, curr_symbol where quhead_curr_id = curr_id
  and quhead_id = <? value("quhead_id") ?>;
 --------------------------------------------------------------------
   
+QUERY: address
+SELECT
+     warehous_descrip,
+     formatAddr(addr_line1, addr_line2, addr_line3, ( addr_city || '  ' || addr_state || '  ' || addr_postalcode), addr_country) AS warehouse_address
+FROM
+     whsinfo, 
+     addr, 
+     quhead
+WHERE 
+     addr_id = warehous_addr_id
+     and quhead_warehous_id = warehous_id
+     AND quhead_id=<? value("quhead_id") ?> ;
+--------------------------------------------------------------------
+  
+QUERY: contact_fax_phone
+select 
+
+cntct_fax,
+cntct_phone
+
+from 
+
+cntct, quhead, custinfo where cust_id = quhead_cust_id  and cust_cntct_id = cntct_id and quhead_id = <? value("quhead_id") ?>;
+
+--------------------------------------------------------------------
+  
 
 --------------------------------------------------------------------
 REPORT: VendorAPHistory
 QUERY: head
 SELECT vend_number,
        vend_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT 1 AS type, apopen_id, -1 AS applyid,
        apopen_docdate AS sortdate, apopen_docnumber AS sortnumber,
        apopen_docnumber AS docnumber,
        formatBoolYN(apopen_open) AS f_open,
        CASE WHEN (apopen_doctype='V') THEN text('Voucher')
             WHEN (apopen_doctype='C') THEN text('C/M')
             WHEN (apopen_doctype='D') THEN text('D/M')
             ELSE text('Other')
        END AS documenttype,
+       apopen_invcnumber AS invoicenumber,
+       apopen_ponumber AS ponumber,
        formatDate(apopen_docdate) AS f_docdate,
        formatDate(apopen_duedate) AS f_duedate,
        formatMoney(apopen_amount) AS f_amount,
        formatMoney((apopen_amount - apopen_paid)) AS f_balance
 FROM apopen
 WHERE ( (apopen_vend_id=<? value("vend_id") ?>)
  AND (apopen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 
 UNION
 SELECT 2 AS type, apopen_id, apapply_source_apopen_id AS applyid,
        apopen_docdate AS sortdate, apopen_docnumber AS sortnumber,
        apapply_source_docnumber AS docnumber,
        '' AS f_open,
        CASE WHEN (apapply_source_doctype='C') THEN text('C/M')
             WHEN (apapply_source_doctype='K') THEN text('Check')
             ELSE text('Other')
        END AS documenttype,
+       '' AS invoicenumber,
+       '' AS ponumber,
        formatDate(apapply_postdate) AS f_docdate,
        '' AS f_duedate,
        formatMoney(apapply_amount) AS f_amount,
        '' AS f_balance
 FROM apapply, apopen
 WHERE ( (apapply_target_apopen_id=apopen_id)
  AND (apapply_vend_id=<? value("vend_id") ?>)
  AND (apopen_vend_id=<? value("vend_id") ?>)
  AND (apopen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 
 UNION
 SELECT 3 AS type, apopen_id, apapply_target_apopen_id AS applyid,
        apopen_docdate AS sortdate, apopen_docnumber AS sortnumber,
        apapply_target_docnumber AS docnumber,
        '' AS f_open,
        CASE WHEN (apapply_target_doctype='V') THEN text('Voucher')
             WHEN (apapply_target_doctype='D') THEN text('D/M')
             ELSE text('Other')
        END AS documenttype,
+       apopen_invcnumber AS invoicenumber,
+       '' AS ponumber,
        formatDate(apapply_postdate) AS f_docdate,
        '' AS f_duedate,
        formatMoney(apapply_amount) AS f_amount,
        '' AS f_balance
 FROM apapply, apopen
 WHERE ( (apapply_source_doctype IN ('C', 'K'))
  AND (apapply_source_doctype=apopen_doctype)
  AND (apapply_source_docnumber=apopen_docnumber)
  AND (apapply_vend_id=<? value("vend_id") ?>)
  AND (apopen_vend_id=<? value("vend_id") ?>)
  AND (apopen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 
 ORDER BY sortdate, apopen_id, type;
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: ViewAPCheckRunEditList
 QUERY: detail
-SELECT checkhead_id AS primaryid,
+SELECT checkhead_amount AS amt_check,
+       checkhead_id AS primaryid,
        -1 AS secondaryid,
        formatBoolYN(checkhead_void) AS f_void,
        formatBoolYN(checkhead_printed) AS f_printed,
        TEXT(checkhead_number) AS number,
        (checkrecip_number || '-' || checkrecip_name) AS description,
        formatDate(checkhead_checkdate) AS f_checkdate,
        formatMoney(checkhead_amount) AS f_amount,
        checkhead_number,
        1 AS orderby
   FROM checkhead LEFT OUTER JOIN
        checkrecip ON ((checkrecip_id=checkhead_recip_id)
 		 AND  (checkrecip_type=checkhead_recip_type))
  WHERE ((checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
    AND  (NOT checkhead_posted)
    AND  (NOT checkhead_replaced)
    AND  (NOT checkhead_deleted) )
 
-UNION SELECT checkitem_checkhead_id AS primaryid,
+UNION SELECT 0 AS amt_check,
+             checkitem_checkhead_id AS primaryid,
              checkitem_id AS secondaryid,
              '' AS f_void,
              '' AS f_printed,
              CASE WHEN (checkitem_ranumber IS NOT NULL) THEN checkitem_ranumber::TEXT
 	          ELSE checkitem_vouchernumber
 	     END AS number,
              CASE WHEN (checkitem_cmnumber IS NOT NULL) THEN checkitem_cmnumber::TEXT
 	          ELSE checkitem_invcnumber
 	     END AS description,
              '' AS f_checkdate,
              formatMoney(checkitem_amount) AS f_amount,
 	     checkhead_number,
              2 AS orderby
         FROM checkitem, checkhead
        WHERE ( (checkitem_checkhead_id=checkhead_id)
          AND (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
          AND (NOT checkhead_posted)
          AND (NOT checkhead_replaced)
          AND (NOT checkhead_deleted) )
 
 ORDER BY checkhead_number, primaryid, orderby;
 --------------------------------------------------------------------
   
 QUERY: head
 SELECT (bankaccnt_name || '-' || bankaccnt_descrip) AS bankaccnt
   FROM bankaccnt
  WHERE (bankaccnt_id=<? value("bankaccnt_id") ?>);
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: WOScheduleByParameterList
 QUERY: Detail
 SELECT formatWONumber(wo_id) AS wonumber,
        wo_status, warehous_code, item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(wo_qtyord) AS ordered,
        formatQty(wo_qtyrcv) AS received,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate
 FROM wo, itemsite, warehous, item, uom
 WHERE ( (wo_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (itemsite_warehous_id=warehous_id)
 
 <? if exists("showOnlyRI") ?>
  AND (wo_status IN ('R', 'I'))
 <? else ?>
  AND (wo_status <> 'C')
 <? endif ?>
 
 <? if exists("showOnlyTopLevel") ?>
  AND (wo_ordtype<>'W')
 <? endif ?>
 
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 
 <? if exists("item_id") ?>
  AND (itemsite_item_id=<? value("item_id") ?>)
+<? elseif exists("wo_id") ?>
+ AND (wo_number IN (SELECT wo_number
+                    FROM wo
+                    WHERE (wo_id=<? value("wo_id") ?>)))
 <? endif ?>
 
 <? if exists("plancode_id") ?>
  AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
  AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
 
 <? if exists("classcode_id") ?>
  AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
  AND (item_classcode_id IN (SELECT classcode_id FROM classcode WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? endif ?>
 
 <? if exists("itemgrp_id") ?>
  AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
  AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem, itemgrp WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id) AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) )))
 <? endif ?>
 
 <? if exists("wrkcnt_id") ?>
  AND (wo_id IN (SELECT wooper_wo_id FROM wooper WHERE (wooper_wrkcnt_id=<? value("wrkcnt_id") ?>)))
 <? elseif exists("wrkcnt_pattern") ?>
  AND (wo_id IN (SELECT wooper_wo_id FROM wooper, wrkcnt WHERE ( (wooper_wrkcnt_id=wrkcnt_id) AND (wrkcnt_code ~ <? value("wrkcnt_pattern") ?>) )))
 <? endif ?>
 
  AND (wo_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 ORDER BY
 
 <? if exists("sortByStartDate") ?>
   wo_startdate,
 <? elseif exists("sortByDueDate") ?>
   wo_duedate,
 <? elseif exists("sortByItemNumber") ?>
   item_number,
 <? endif ?>
 
   wo_number, wo_subnumber;
     
 --------------------------------------------------------------------
   
 QUERY: Head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS f_startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS f_enddate,
 <? if exists("warehous_id") ?>
        warehous_code
 FROM warehous
 WHERE (warehous_id=<? value("warehous_id") ?>);
 <? else ?>
        TEXT('All Warehouses') AS warehous_code;
 <? endif ?>
 
 --------------------------------------------------------------------
   
 QUERY: TypeCodeParam
 SELECT
 <? if exists("classcode_id") ?>
   TEXT('Class Code:')
 <? elseif exists("classcode_pattern") ?>
   TEXT('Class Code Pattern:')
 <? elseif exists("plancode_id") ?>
   TEXT('Planner Code:')
 <? elseif exists("plancode_pattern") ?>
   TEXT('Planner Code Pattern:')
 <? elseif exists("itemgrp_id') ?>
   TEXT('Item Group:')
 <? elseif exists("itemgrp_pattern") ?>
   TEXT('Item Group Pattern:')
 <? elseif exists("wrkcnt_id") ?>
   TEXT('Work Center:')
 <? elseif exists("wrkcnt_pattern") ?>
   TEXT('Work Center Pattern:')
 <? else ?>
   TEXT('')
 <? endif ?> AS type,
 <? if exists("classcode_id") ?>
   (SELECT (classcode_code||'-'||classcode_descrip) FROM classcode WHERE (classcode_id=<? value("classcode_id") ?>))
 <? elseif exists("classcode_pattern") ?>
   TEXT(<? value("classcode_pattern") ?>)
 <? elseif exists("plancode_id") ?>
   (SELECT (plancode_code||'-'||plancode_name) FROM plancode WHERE (plancode_id=<? value("plancode_id") ?>))
 <? elseif exists("plancode_pattern") ?>
   TEXT(<? value("plancode_pattern") ?>)
 <? elseif exists("itemgrp_id') ?>
   (SELECT (itemgrp_name||'-'||itemgrp_descrip) FROM itemgrp WHERE (itemgrp_id=<? value("itemgrp_id") ?>))
 <? elseif exists("itemgrp_pattern") ?>
   TEXT(<? value("itemgrp_pattern") ?>)
 <? elseif exists("wrkcnt_id") ?>
   (SELECT (wrkcnt_code||'-'||wrkcnt_descrip) FROM wrkcnt WHERE (wrkcnt_id=<? value("wrkcnt_id") ?>))
 <? elseif exists("wrkcnt_pattern") ?>
   TEXT(<? value("wrkcnt_pattern") ?>)
 <? else ?>
   TEXT('')
 <? endif ?> AS code;
 --------------------------------------------------------------------
   
 QUERY: ItemParameter
 SELECT
 <? if exits("item_id") ?>
   item_number
 FROM item
 WHERE (item_id=<? value("item_id") ?>);
 <? else ?>
   TEXT('All') AS item_number;
 <? endif ?>
 --------------------------------------------------------------------
   