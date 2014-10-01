--------------------------------------------------------------------
REMOVED REPORTS:
SequencedBOM
--------------------------------------------------------------------
CHANGED REPORTS:
CreditMemo
ExpenseCategoriesMasterList
GLTransactions
IncidentsByCRMAccount
Invoice
ListTransferOrders
POHistory
PackingList-Shipment
PackingList
PendingBOMChanges
Quote
RunningAvailability
SingleLevelBOM
SummarizedSalesByCustomerType
WOScheduleByParameterList


 --------------------------------------------------------------------
 REPORT: CreditMemo
 QUERY: GroupExtended
-SELECT formatExtPrice(COALESCE(cmhead_freight,0.0) + COALESCE(cmhead_tax,0.0) + COALESCE(cmhead_misc,0.0) +
-         ( SELECT COALESCE(SUM((cmitem_qtycredit * cmitem_qty_invuomratio) * cmitem_unitprice / cmitem_price_invuomratio), 0.0)
-             FROM cmitem, itemsite, item
-            WHERE ((cmitem_cmhead_id=%1)
-              AND (cmitem_itemsite_id=itemsite_id)
-              AND (itemsite_item_id=item_id)
-             )
-           )
+SELECT formatExtPrice( COALESCE(cmhead_freight,0.0) +
+                       ( SELECT COALESCE(SUM(tax * -1.0), 0)
+                         FROM ( SELECT ROUND(SUM(taxdetail_tax), 2) AS tax
+                                FROM tax JOIN calculateTaxDetailSummary('CM', cmhead_id, 'T')
+                                           ON (taxdetail_tax_id=tax_id)
+                                GROUP BY tax_id ) AS data ) +
+                       COALESCE(cmhead_misc,0.0) +
+                       ( SELECT COALESCE(SUM((cmitem_qtycredit * cmitem_qty_invuomratio) *
+                                              cmitem_unitprice / cmitem_price_invuomratio), 0.0)
+                         FROM cmitem
+                         WHERE (cmitem_cmhead_id=%1) )
          ) AS totaldue,
        formatExtPrice(COALESCE(cmhead_freight,0.0)) AS freight,
-       formatExtPrice(COALESCE(cmhead_tax,0.0)) AS tax,
+       ( SELECT formatExtPrice(COALESCE(SUM(tax * -1.0), 0))
+         FROM ( SELECT ROUND(SUM(taxdetail_tax), 2) AS tax
+                FROM tax JOIN calculateTaxDetailSummary('CM', cmhead_id, 'T')
+                           ON (taxdetail_tax_id=tax_id)
+                GROUP BY tax_id ) AS data ) AS tax,
        formatExtPrice(COALESCE(cmhead_misc,0.0)) AS misc
   FROM cmhead
  WHERE (cmhead_id=%1);
+

 --------------------------------------------------------------------
 REPORT: ExpenseCategoriesMasterList
 QUERY: detail
 SELECT
   expcat_code,
   expcat_descrip,
-          (SELECT
-                 accnt.accnt_company || '-' ||
-                 accnt.accnt_profit|| '-' ||
-                 accnt.accnt_number|| '-' ||
-                 accnt.accnt_sub || '   ' ||
-                 accnt_descrip
-           FROM
-                 public.expcat,
-                 public.accnt
-           WHERE
-                 expcat.expcat_exp_accnt_id = accnt.accnt_id AND
-                 A.expcat_id = expcat_id
-           ) AS exp_accnt,
-
-  (SELECT
-                 accnt.accnt_company || '-' ||
-                 accnt.accnt_profit|| '-' ||
-                 accnt.accnt_number|| '-' ||
-                 accnt.accnt_sub || '   ' ||
-                 accnt_descrip
-           FROM
-                 public.expcat,
-                 public.accnt
-           WHERE
-                 expcat.expcat_purchprice_accnt_id = accnt.accnt_id AND
-                 A.expcat_id = expcat_id
-           ) AS ppv_accnt,
-
-  (SELECT
-                 accnt.accnt_company || '-' ||
-                 accnt.accnt_profit|| '-' ||
-                 accnt.accnt_number|| '-' ||
-                 accnt.accnt_sub || '   ' ||
-                 accnt_descrip
-           FROM
-                 public.expcat,
-                 public.accnt
-           WHERE
-                 expcat.expcat_liability_accnt_id = accnt.accnt_id AND
-                 A.expcat_id = expcat_id
-           ) AS poliab_accnt,
-
-  (SELECT
-                 accnt.accnt_company || '-' ||
-                 accnt.accnt_profit|| '-' ||
-                 accnt.accnt_number|| '-' ||
-                 accnt.accnt_sub || '   ' ||
-                 accnt_descrip
-           FROM
-                 public.expcat,
-                 public.accnt
-           WHERE
-                 expcat.expcat_freight_accnt_id = accnt.accnt_id AND
-                 A.expcat_id = expcat_id
-           ) AS polinefrgt_accnt
-
+  formatGLAccountLong(expcat_exp_accnt_id) AS exp_accnt,
+  formatGLAccountLong(expcat_purchprice_accnt_id) AS ppv_accnt,
+  formatGLAccountLong(expcat_liability_accnt_id) AS poliab_accnt,
+  formatGLAccountLong(expcat_freight_accnt_id) AS polinefrgt_accnt
 FROM
   expcat AS A
 ORDER BY expcat_code;

 --------------------------------------------------------------------
 REPORT: GLTransactions
 QUERY: detail
+<? if exists("beginningBalance") ?>
+SELECT -1 AS gltrans_id,
+       <? value("startDate") ?> AS gltrans_created, formatDate(<? value("startDate") ?>) AS transdate,
+       '' AS gltrans_source, '' AS gltrans_doctype, '' AS gltrans_docnumber, '' AS invhist_docnumber,
+       'Beginning Balance' AS transnotes,
+       (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
+       CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
+                     formatMoney(ABS(<? value("beginningBalance") ?>))
+            ELSE ''
+       END AS f_debit,
+       CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
+                     ABS(<? value("beginningBalance") ?>)
+            ELSE 0
+       END AS debit_amt,

-  SELECT gltrans_id,
+       CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
+                     formatMoney(ABS(<? value("beginningBalance") ?>))
+            ELSE ''
+       END AS f_credit,
+       CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
+                     ABS(<? value("beginningBalance") ?>)
+            ELSE 0
+       END AS credit_amt,
+       <? value("beginningBalance") ?> * -1 AS balance_amt,
+       <? value("beginningBalance") ?> AS gltrans_amount,
+       <? value("beginningBalance") ?> AS running,
+       NULL AS f_posted,
+       NULL AS f_username,
+       -1 AS gltrans_sequence
+ FROM accnt
+ WHERE (accnt_id=<? value("accnt_id") ?>)
+UNION
+<? endif ?>
+
+SELECT gltrans_id,
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
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
        )
-  <? if exists("beginningBalance") ?>
-  UNION SELECT -1,
-        <? value("startDate") ?>, formatDate(<? value("startDate") ?>),
-        '', '', '', '',
-        'Beginning Balance',
-        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip),
-        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
-                      formatMoney(ABS(<? value("beginningBalance") ?>))
-             ELSE ''
-        END,
-        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
-                      ABS(<? value("beginningBalance") ?>)
-             ELSE 0
-        END,
-
-        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
-                      formatMoney(ABS(<? value("beginningBalance") ?>))
-             ELSE ''
-        END,
-        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
-                      ABS(<? value("beginningBalance") ?>)
-             ELSE 0
-        END,
-        <? value("beginningBalance") ?> * -1,
-        <? value("beginningBalance") ?>,
-        <? value("beginningBalance") ?>,
-        NULL,
-        NULL,
-        -1
-  FROM accnt
-  WHERE (accnt_id=<? value("accnt_id") ?>)
 ORDER BY gltrans_created <? if not exists("beginningBalance") ?> DESC <? endif ?>,
-        gltrans_sequence, gltrans_amount;
+        gltrans_sequence, gltrans_amount
+
+;

 --------------------------------------------------------------------
 REPORT: IncidentsByCRMAccount
 QUERY: detail
 SELECT crmacct_id, COALESCE(TEXT(incdt_id), '') AS incdt_id, todoitem_id,
        crmacct_number, crmacct_name,
        incdt_number, DATE(incdt_timestamp) AS incdt_timestamp,
        CASE WHEN(incdt_status='N') THEN <? value("new") ?>
             WHEN(incdt_status='F') THEN <? value("feedback") ?>
             WHEN(incdt_status='C') THEN <? value("confirmed") ?>
             WHEN(incdt_status='A') THEN <? value("assigned") ?>
             WHEN(incdt_status='R') THEN <? value("resolved") ?>
             WHEN(incdt_status='L') THEN <? value("closed") ?>
             ELSE incdt_status
        END AS incdt_status,
        incdt_assigned_username, incdt_summary,
        todoitem_due_date, todoitem_name,
        todoitem_username AS todoitem_usrname,
        todoitem_assigned_date, todoitem_status,
        incdtseverity_name,
        incdtpriority_name
 FROM crmacct
 <? if exists("showAcctsWOIncdts") ?>
   LEFT OUTER
 <? endif ?>
       JOIN incdt ON (incdt_crmacct_id=crmacct_id
                      AND (incdt_timestamp BETWEEN <? value("startDate") ?>
                                               AND <? value("endDate") ?>)
                      <? if not exists("showClosed") ?>
                        AND (incdt_status != 'L')
                      <? endif ?>)
-      LEFT OUTER JOIN todoitem ON (todoitem_incdt_id=incdt_id)
+      LEFT OUTER JOIN todoitem ON (todoitem_incdt_id=incdt_id AND
+                                  (todoitem_status IS NULL OR todoitem_status != 'C'))
       LEFT OUTER JOIN incdtseverity ON (incdt_incdtseverity_id = incdtseverity_id)
       LEFT OUTER JOIN incdtpriority ON (incdt_incdtpriority_id = incdtpriority_id)
-WHERE ((todoitem_status IS NULL OR todoitem_status != 'C')
+WHERE (TRUE
 <? if exists("crmacct_id") ?>
   AND (crmacct_id=<? value("crmacct_id") ?>)
 <? endif ?>
 <? if exists("showAcctsWOIncdts") ?>
    AND (incdt_id IS NULL OR (true
 <? endif ?>

 <? if exists("showAcctsWOIncdts") ?>
    ))
 <? endif ?>
  )
 ORDER BY crmacct_name, incdt_timestamp, todoitem_due_date;

 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: GroupExtended
 SELECT *,
         formatMoney(invchead_misc_amount) AS f_misc,
-        formatMoney(head_tax + item_tax)  AS f_tax,
+       formatMoney(tax)                  AS f_tax,
         formatMoney(invchead_freight)     AS f_freight,
         formatMoney(invchead_payment)     AS f_payment,
-        formatMoney(noNeg(invchead_freight + invchead_misc_amount + head_tax + item_tax +
+       formatMoney(noNeg(invchead_freight + invchead_misc_amount + tax +
                           itemtotal - total_allocated)) AS f_totaldue,
-        formatMoney(noNeg(invchead_freight + invchead_misc_amount + head_tax + item_tax +
+       formatMoney(noNeg(invchead_freight + invchead_misc_amount + tax +
                           itemtotal - total_allocated) - (invchead_payment+applied)) AS f_netdue,
         formatMoney(total_allocated) AS f_allocated
   FROM (SELECT invchead_misc_amount, invchead_freight,
                invchead_payment, invchead_notes, invchead_misc_descrip,
-               (SELECT COALESCE(SUM(taxhist_tax), 0) -- COALESCE(SUM()) because taxhist_tax is NOT NULL
-                FROM invcheadtax                     -- and we want 0 if there is no taxhist
-                WHERE (taxhist_parent_id=invchead_id)) AS head_tax,
-               (SELECT COALESCE(SUM(taxhist_tax), 0)
-                FROM invcitem JOIN invcitemtax ON (taxhist_parent_id=invcitem_id)
-                WHERE (invcitem_invchead_id=invchead_id)) AS item_tax,
+              (SELECT SUM(tax)
+                FROM (
+                SELECT ROUND(SUM(taxdetail_tax),2) AS tax
+                FROM tax
+                 JOIN calculateTaxDetailSummary('I', <? value("invchead_id") ?>, 'T') ON (taxdetail_tax_id=tax_id)
+	   GROUP BY tax_id) AS data) AS tax,
                SUM(COALESCE(ROUND(invcitem_billed *
                                   invcitem_qty_invuomratio *
                                   invcitem_price /
                                   COALESCE(invcitem_price_invuomratio,1), 2), 0))
                AS itemtotal,
                SUM(COALESCE(arapply_applied, 0)) AS applied,
                COALESCE(
                CASE WHEN invchead_posted THEN
                   (SELECT SUM(COALESCE(currToCurr(arapply_curr_id, t.aropen_curr_id,
                                                   arapply_applied, t.aropen_docdate), 0))
                    FROM arapply, aropen s, aropen t
                    WHERE ( (s.aropen_id=arapply_source_aropen_id)
                      AND   (arapply_target_aropen_id=t.aropen_id)
                      AND   (arapply_target_doctype='I')
                      AND   (arapply_target_docnumber=invchead_invcnumber)
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
              LEFT OUTER JOIN arapply ON (arapply_target_docnumber=invchead_invcnumber AND arapply_source_doctype='K')
         WHERE (invchead_id=<? value("invchead_id") ?>)
-        GROUP BY invchead_freight, invchead_misc_amount, head_tax, item_tax,
+       GROUP BY invchead_freight, invchead_misc_amount, tax,
                  invchead_payment, invchead_notes, invchead_misc_descrip,
                  total_allocated
   ) AS dummy_outer
   ;

 --------------------------------------------------------------------
 REPORT: ListTransferOrders
 QUERY: detail
 SELECT tohead_number,
        tohead_srcname,
        tohead_trnsname,
        tohead_destname,
        formatDate(tohead_orderdate) AS f_orderdate,
        formatDate(MIN(toitem_schedshipdate)) AS f_scheddate,
        formatDate(DATE(MAX(shipitem_shipdate))) AS f_shipdate,
        CASE WHEN (tohead_status='C') THEN 'Closed'
             WHEN (tohead_status='O') THEN 'Open'
             ELSE tohead_status
             END AS status
   FROM tohead, toitem LEFT OUTER JOIN
        (shipitem JOIN
         shiphead ON (shipitem_shiphead_id=shiphead_id
                     AND shiphead_order_type='TO')
        ) ON (shipitem_orderitem_id=toitem_id)
  WHERE ((toitem_tohead_id=tohead_id)
    AND  (toitem_status<>'X')
+<? if exists("tohead_status") ?>
+   AND (tohead_status=<? value("tohead_status") ?>)
+<? elseif exists("excludeClosed") ?>
+   AND (tohead_status <> 'C')
+<? endif ?>
 <? if exists("src_warehous_id") ?>
    AND  (tohead_src_warehous_id=<? value("src_warehous_id") ?>)
 <? endif ?>
 <? if exists("dest_warehous_id") ?>
    AND  (tohead_dest_warehous_id=<? value("dest_warehous_id") ?>)
 <? endif ?>
-<? if exists("tohead_status") ?>
-   AND (tohead_status=<? value("tohead_status") ?>)
-<? endif ?>
 )
 GROUP BY tohead_number, tohead_srcname, tohead_trnsname, tohead_destname,
          tohead_orderdate, tohead_status
 ORDER BY tohead_number;

 --------------------------------------------------------------------
 REPORT: POHistory
 QUERY: detail
-SELECT poitem_linenumber as f_number,
-       item_number as f_item, uom_name as f_uom1,
-       formatDate(poitem_duedate) as f_duedate,
-       poitem_vend_item_number as f_vend_item,
-       poitem_vend_uom as f_uom2,
-       formatQty(poitem_qty_ordered) as f_ordered,
-       formatqty(poitem_qty_received) as f_received
-  FROM poitem, itemsite, item, uom
- WHERE ((poitem_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=item_id)
-   AND (item_inv_uom_id=uom_id)
-   AND (poitem_pohead_id=<? value("pohead_id") ?>))
-ORDER BY poitem_linenumber;
+SELECT 
+poitem_linenumber as f_number, 
+item_number as f_item, 
+uom_name as f_uom1,
+formatDate(poitem_duedate) as f_duedate,
+poitem_vend_item_number as f_vend_item,
+poitem_vend_uom as f_uom2,
+formatQty(poitem_qty_ordered) as f_ordered,
+formatqty(poitem_qty_received) as f_received
+FROM poitem, itemsite, item, uom
+WHERE ((poitem_itemsite_id=itemsite_id)
+AND (itemsite_item_id=item_id)
+AND (item_inv_uom_id=uom_id)
+AND (poitem_pohead_id=<? value("pohead_id") ?>)) 
+
+UNION
+
+SELECT 
+poitem_linenumber as f_number, 
+poitem_vend_item_number as f_item, 
+expcat_code as f_uom1,
+formatDate(poitem_duedate) as f_duedate,
+poitem_vend_item_descrip as f_vend_item,
+expcat_descrip as f_uom2,
+formatQty(poitem_qty_ordered) as f_ordered,
+formatqty(poitem_qty_received) as f_received
+FROM poitem, expcat
+WHERE ((poitem_expcat_id = expcat_id)
+AND (poitem_pohead_id=<? value("pohead_id") ?>)) 
+
+ORDER BY f_number;

 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: head
 SELECT shiphead_number, 'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
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
-       '' AS billtoname,
-       '' AS billing_address,
+       tohead_srcname AS billtoname,
+       formataddr(tohead_srcaddress1, tohead_srcaddress2,
+                   tohead_srcaddress3,
+                  (tohead_srccity || ' ' || tohead_srcstate ||
+                   ' ' || tohead_srcpostalcode), tohead_srccountry) AS billing_address,
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

 QUERY: detail
 SELECT 1 AS groupby,
 --     coitem_linenumber AS linenumber,
 --     In 3.1 replace line above with line below to support
 --     kitting functionality
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo AS memo,
        CASE WHEN (coitem_custpn != '') THEN coitem_custpn
             ELSE item_number
        END AS item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        itemsellinguom(item_id) AS shipuom,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
             ELSE item_descrip1
        END AS item_descrip1,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
             ELSE item_descrip2
        END AS item_descrip2,

        formatQty(coitem_qtyord) AS ordered,
        (SELECT formatQty(SUM(coship_qty)) FROM coship WHERE ((coship_cosmisc_id=<? value("cosmisc_id") ?>) AND (coship_coitem_id=coitem_id))) AS shipped,

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
        END AS f_status,
        CASE
          WHEN (getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) = '') THEN
            ''
          ELSE
            'Serial #/Lot Information:'
        END AS lotserial_title,
        getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) AS lotserial,
        CASE
          WHEN (getPacklistCharName(coship_cosmisc_id, coitem_id) = '') THEN
            ''
          ELSE
            'Characteristics:'
        END AS char_title,
        getPacklistCharName(coship_cosmisc_id, coitem_id) AS char_name,
        getPacklistCharValue(coship_cosmisc_id, coitem_id) AS char_value
   FROM coship
        JOIN coitem ON (coitem_id=coship_coitem_id)
        JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
        JOIN item ON (item_id=itemsite_item_id)
        JOIN uom ON (uom_id=item_inv_uom_id)
        LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn)
  WHERE ( (coitem_status <> 'X')
    AND (coship_cosmisc_id=<? value("cosmisc_id") ?>)
 )
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
 --     For 3.1 added CAST to match column type of corresponding column in other SELECT
 --     in this UNION
        CAST(toitem_linenumber AS text) AS linenumber,
-       '' AS memo,
+       toitem_notes AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,

        (SELECT formatQty(SUM(shipitem_qty))
         FROM shipitem
         WHERE ((shipitem_shiphead_id=<? value("shiphead_id") ?>)
           AND  (shipitem_orderitem_id=toitem_id))
        ) AS shipped,

        toitem_status AS f_status,
        CASE
          WHEN (getPacklistItemLotSerial(shiphead_id, toitem_id) = '') THEN
            ''
          ELSE
            'Serial #/Lot Information:'
        END AS lotserial_title,
        getPacklistItemLotSerial(shiphead_id, toitem_id) AS lotserial,
        '' AS char_title,
        '' AS char_name,
        '' AS char_value
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
 REPORT: PackingList
 QUERY: head
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
 	      'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
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
        COALESCE(shiphead_shipvia, tohead_shipvia) AS shipvia,
        tohead_destphone AS shiptophone,
        TEXT(tohead_number) AS cohead_custponumber,
        formatDate(tohead_orderdate) AS orderdate,
        tohead_shipcomments AS shipcomments,
-       '' AS billtoname,
-       '' AS billing_address,
+       tohead_srcname AS billtoname,
+       formataddr(tohead_srcaddress1, tohead_srcaddress2,
+                   tohead_srcaddress3,
+                  (tohead_srccity || ' ' || tohead_srcstate ||
+                   ' ' || tohead_srcpostalcode), tohead_srccountry) AS billing_address,
        tohead_destname AS shiptoname,
        formataddr(tohead_destaddress1, tohead_destaddress2,
                    tohead_destaddress3,
                   (tohead_destcity || ' ' || tohead_deststate ||
                    ' ' || tohead_destpostalcode), tohead_destcountry) AS shipping_address,
        'Transfer Order' AS cust_number,
        tohead_destcntct_name AS cust_contact,
        tohead_destphone AS cust_phone,
        '' AS terms_descrip
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

 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber AS linenumber,
        coitem_memo AS memo,
        CASE WHEN (coitem_custpn != '') THEN coitem_custpn
             ELSE item_number
        END AS item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        itemsellinguom(item_id) AS shipuom,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
             ELSE item_descrip1
        END AS item_descrip1,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
             ELSE item_descrip2
        END AS item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        ( SELECT formatQty(COALESCE(SUM(shipitem_qty), 0))
          FROM shipitem JOIN shiphead ON (shiphead_id=shipitem_shiphead_id)
          WHERE ((shipitem_orderitem_id=coitem_id) AND (shiphead_order_type='SO')) ) AS atShipping,

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
   FROM coitem
        JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
        JOIN item ON (item_id=itemsite_item_id)
        JOIN uom ON (uom_id=item_inv_uom_id)
        LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn)
  WHERE ( (coitem_status <> 'X')
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
 GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, shipuom,
          coitem_custpn, itemalias_usedescrip, itemalias_descrip1, itemalias_descrip2,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
        toitem_linenumber AS linenumber,
-       '' AS memo,
+       toitem_notes AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,
        ( SELECT formatQty(COALESCE(SUM(shipitem_qty), 0))
          FROM shipitem JOIN shiphead ON (shiphead_id=shipitem_shiphead_id)
          WHERE ((shipitem_orderitem_id=toitem_id) AND (shiphead_order_type='TO')) ) AS atShipping,

        toitem_status AS f_status
   FROM itemsite, item, toitem, tohead, uom
  WHERE ((toitem_item_id=item_id)
    AND  (item_inv_uom_id=uom_id)
    AND  (item_id=itemsite_item_id)
    AND  (toitem_tohead_id=tohead_id)
    AND  (toitem_status <> 'X')
    AND  (tohead_src_warehous_id=itemsite_warehous_id)
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
 REPORT: PendingBOMChanges
 QUERY: head
 SELECT item_number,
        uom_name,
        item_descrip1,
        item_descrip2,
-       CASE WHEN (<? value("cutOffDate") ?> >= date('12/31/2099')) THEN text('Latest')
+       CASE WHEN (<? value("cutOffDate") ?> >= date('2099-12-31')) THEN text('Latest')
             ELSE formatDate(<? value("cutOffDate") ?>)
        END AS cutoffdate
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: Quote
 QUERY: totals
 SELECT 1 as one,
        formatExtPrice(subtotal) AS f_subtotal,
        formatExtPrice(tax) AS f_tax,
        formatExtPrice(quhead_freight) AS f_freight,
        formatExtPrice(quhead_misc) AS f_misc,
-       formatExtPrice(subtotal + tax + quhead_freight) AS f_total
+       formatExtPrice(subtotal + tax + quhead_freight + quhead_misc) AS f_total
   FROM quhead,
        (SELECT SUM((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) AS subtotal
           FROM quitem
          WHERE (quitem_quhead_id=<? value("quhead_id") ?>) ) AS subtot,
        (SELECT COALESCE(SUM(tax),0) AS tax
         FROM (
           SELECT ROUND(SUM(taxdetail_tax),2) AS tax
           FROM tax
           JOIN calculateTaxDetailSummary('Q', <? value("quhead_id") ?>, 'T') ON (taxdetail_tax_id=tax_id)
 	GROUP BY tax_id) AS data) AS taxtot



  WHERE (quhead_id=<? value("quhead_id") ?>);

 --------------------------------------------------------------------
 REPORT: RunningAvailability
 QUERY: detail
 <? if exists("MultiWhs") ?>
 SELECT tohead_id AS orderid, toitem_id AS altorderid, 'T/O' AS ordertype,
        TEXT(tohead_number) AS ordernumber,
        1 AS sequence,
        tohead_srcname || '/' || tohead_destname AS item_number,
        formatDate(toitem_duedate) AS duedate,
        toitem_duedate AS r_duedate,
        (toitem_duedate < CURRENT_DATE) AS late,
        formatQty(toitem_qty_ordered) AS f_qtyordered,
        formatQty(toitem_qty_received) AS f_qtyreceived,
        formatQty(noNeg(toitem_qty_ordered - toitem_qty_received)) AS f_balance,
        noNeg(toitem_qty_ordered - toitem_qty_received) AS balance
 FROM tohead, toitem
 WHERE ((toitem_tohead_id=tohead_id)
   AND  (toitem_status = 'O')
   AND  (toitem_item_id=<? value("item_id") ?>)
   AND  (tohead_dest_warehous_id=<? value("warehous_id") ?>)
   AND  (toitem_qty_ordered > toitem_qty_received) )

 UNION
 SELECT tohead_id AS orderid, toitem_id AS altorderid, 'T/O' AS ordertype,
        TEXT(tohead_number) AS ordernumber,
        1 AS sequence,
        tohead_srcname || '/' || tohead_destname AS item_number,
        formatDate(toitem_duedate) AS duedate,
        toitem_duedate AS r_duedate,
        (toitem_duedate < CURRENT_DATE) AS late,
        formatQty(toitem_qty_ordered) AS f_qtyordered,
        formatQty(toitem_qty_received) AS f_qtyreceived,
        formatQty(-1 * noNeg(toitem_qty_ordered - toitem_qty_shipped - qtyAtShipping('TO', toitem_id))) AS f_balance,
        -1 * noNeg(toitem_qty_ordered - toitem_qty_received) AS balance
 FROM tohead, toitem
 WHERE ((toitem_tohead_id=tohead_id)
   AND  (toitem_status = 'O')
   AND  (toitem_item_id=<? value("item_id") ?>)
   AND  (tohead_src_warehous_id=<? value("warehous_id") ?>)
   AND  (toitem_qty_ordered - toitem_qty_shipped - qtyAtShipping('TO', toitem_id)) > 0 )

 UNION
 <? endif ?>
 SELECT wo_id AS orderid, -1 AS altorderid,
        'W/O' AS ordertype,
        formatWoNumber(wo_id) AS ordernumber,
        1 AS sequence,
        item_number,
        formatDate(wo_duedate) AS duedate,
        wo_duedate AS r_duedate,
        (wo_duedate < CURRENT_DATE) AS late,
        formatQty(wo_qtyord) AS f_qtyordered,
        formatQty(wo_qtyrcv) AS f_qtyreceived,
        formatQty(noNeg(wo_qtyord - wo_qtyrcv)) AS f_balance,
        noNeg(wo_qtyord - wo_qtyrcv) AS balance
 FROM wo, itemsite, item
 WHERE ((wo_status<>'C')
   AND  (wo_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>)
   AND  (item_type NOT IN ('C', 'Y')))

+<? if exists("Manufacturing") ?>
 UNION
 SELECT wo_id AS orderid, -1 AS altorderid,
        'W/O' AS ordertype,
        formatWoNumber(wo_id) AS ordernumber,
        1 AS sequence,
        item_number,
        formatDate(wo_duedate) AS duedate,
        wo_duedate AS r_duedate,
        (wo_duedate < CURRENT_DATE) AS late,
        formatQty(wo_qtyord * brddist_stdqtyper) AS f_qtyordered,
        formatQty(wo_qtyrcv * brddist_stdqtyper) AS f_qtyreceived,
        formatQty(noNeg((wo_qtyord - wo_qtyrcv) * brddist_stdqtyper)) AS f_balance,
        noNeg((wo_qtyord - wo_qtyrcv) * brddist_stdqtyper) AS balance
-FROM brddist, wo, itemsite, item
+FROM xtmfg.brddist, wo, itemsite, item
 WHERE ((wo_status<>'C')
   AND  (brddist_wo_id=wo_id)
   AND  (wo_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (brddist_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>)
   AND  (item_type IN ('C', 'Y')) )
+<? endif ?>

 UNION
 SELECT wo_id AS orderid, womatl_id AS altorderid,
       'W/O' AS ordertype,
       formatWoNumber(wo_id) AS ordernumber,
       2 AS sequence,
       item_number,
       formatDate(womatl_duedate) AS duedate,
       womatl_duedate AS r_duedate,
       FALSE AS late,
       formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyreq)) AS f_qtyordered,
       formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyiss)) AS f_qtyreceived,
       formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1))) AS f_balance,
       itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1)) AS balance
 FROM womatl, wo, itemsite AS wois, item, itemsite AS womatlis
 WHERE ((wo_status<>'C')
   AND  (wo_itemsite_id=wois.itemsite_id)
   AND  (wois.itemsite_item_id=item_id)
   AND  (womatl_wo_id=wo_id)
   AND  (womatlis.itemsite_item_id=<? value("item_id") ?>)
   AND  (womatlis.itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (womatl_itemsite_id=womatlis.itemsite_id) )

 UNION
 SELECT pohead_id AS orderid, poitem_id AS altorderid,
       'P/O' AS ordertype,
       TEXT(pohead_number) AS ordernumber,
       1 AS sequence,
       '' AS item_number,
       formatDate(poitem_duedate) AS duedate,
       poitem_duedate AS r_duedate,
       (poitem_duedate < CURRENT_DATE) AS late,
       formatQty(poitem_qty_ordered * poitem_invvenduomratio) AS f_qtyordered,
       formatQty(poitem_qty_received * poitem_invvenduomratio) AS f_qtyreceived,
       formatQty(noNeg(poitem_qty_ordered - poitem_qty_received) * poitem_invvenduomratio) AS f_balance,
       (noNeg(poitem_qty_ordered - poitem_qty_received) * poitem_invvenduomratio) AS balance
 FROM pohead, poitem, itemsite, item
 WHERE ((poitem_pohead_id=pohead_id)
   AND  (poitem_status <> 'C')
   AND  (poitem_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=item_id)
   AND  (item_id=<? value("item_id") ?>)
   AND  (item_type IN ('P', 'M', 'C', 'O')) )

 UNION
 SELECT cohead_id AS orderid, coitem_id AS altorderid,
        'S/O' AS ordertype,
        TEXT(cohead_number) AS ordernumber,
        2 AS sequence,
        cust_name AS item_number,
        formatDate(coitem_scheddate) AS duedate,
        coitem_scheddate AS r_duedate,
        (coitem_scheddate < CURRENT_DATE) AS late,
        formatQty(coitem_qty_invuomratio * coitem_qtyord) AS f_qtyordered,
        formatQty(coitem_qty_invuomratio * (coitem_qtyshipped - coitem_qtyreturned + qtyAtShipping(coitem_id))) AS f_qtyreceived,
        formatQty(coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS f_balance,
        (coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS balance
 FROM coitem, cohead, cust, itemsite, item
 WHERE ((coitem_status='O')
   AND  (cohead_cust_id=cust_id)
   AND  (coitem_cohead_id=cohead_id)
   AND  (coitem_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=item_id)
   AND  (item_id=<? value("item_id") ?>)
   AND  item_sold )

 <? if exists("showPlanned") ?>
 <? if exists("showMRPplan") ?>
 UNION
 SELECT planord_id AS orderid, -1 AS altorderid,
        'Planned P/O' AS ordertype,
 --       CASE WHEN (planord_firm) THEN <? value("firmPo") ?>
 -- 	   ELSE <? value("plannedPo") ?>
 --       END AS ordernumber,
 --2.3 replaced case above with actual order number for higher level demand
        CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
        '' AS item_number,
        formatDate(planord_duedate) AS duedate,
        planord_duedate AS r_duedate,
        FALSE AS late,
        formatQty(planord_qty) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(planord_qty) AS f_balance,
        planord_qty AS balance
 FROM planord, itemsite
 WHERE ((planord_type='P')
   AND  (planord_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )

 UNION
 SELECT planord_id AS orderid, -1 AS altorderid,
        'Planned W/O' AS ordertype,
 --       CASE WHEN (planord_firm) THEN <? value("firmWo") ?>
 --	    ELSE <? value("plannedWo") ?>
 --       END AS ordernumber,
 --2.3 replaced case above with actual order number
        CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
        '' AS item_number,
        formatDate(planord_duedate) AS duedate,
        planord_duedate AS r_duedate,
        FALSE AS late,
        formatQty(planord_qty) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(planord_qty) AS f_balance,
        planord_qty AS balance
 FROM planord, itemsite
 WHERE ((planord_type='W')
   AND  (planord_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )

 UNION
 SELECT planreq_id AS orderid, -1 AS altorderid,
        'Planned W/O' AS ordertype,
 --       CASE WHEN (planord_firm) THEN <? value("firmWoReq") ?>
 --	    ELSE <? value("plannedWoReq") ?>
 --       END AS ordernumber,
 --2.3 replaced case above with actual order number for higher level demand
        CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
 --2.3 Start
 --Starting here a sub-select gets the planned order number for the higher level demand
              (SELECT item_number
                 FROM item, itemsite
                WHERE((itemsite_item_id=item_id)
                  AND (itemsite_id=planord_itemsite_id))
              ) AS item_number,
 --End of subselect to get higher level item number
 --2.3 Start
        formatDate(planord_startdate) AS duedate,
        planord_startdate AS r_duedate,
        FALSE AS late,
        formatQty(planreq_qty) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(planreq_qty * -1) AS f_balance,
        (planreq_qty * -1) AS balance
 FROM planreq, planord, itemsite, item
 WHERE ((planreq_source='P')
   AND  (planreq_source_id=planord_id)
   AND  (planreq_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )
 <? endif ?>

 UNION
 SELECT pr_id AS orderid, -1 AS altorderid,
        'P/R' AS ordertype,
 --       <? value("pr") ?> AS ordernumber,
 --2.3 replaced above with actual order number
        CAST(pr_number AS text) AS ordernumber,
        1 AS sequence,
        '' AS item_number,
        formatDate(pr_duedate) AS duedate,
        pr_duedate AS r_duedate,
        FALSE AS late,
        formatQty(pr_qtyreq) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(pr_qtyreq) AS f_balance,
        pr_qtyreq AS balance
 FROM pr, itemsite, item
 WHERE ((pr_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (pr_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )
 <? endif ?>

 UNION

 SELECT -1 AS orderid, -1 AS altorderid,
              '' AS ordertype,
              '' AS ordernumber,
              -1 AS sequence,
              'Initial QOH' AS item_number,
              '' AS duedate,
              date('1/1/1978') AS r_duedate,
              FALSE AS late,
              '' AS f_qtyordered,
              '' AS f_qtyreceived,
              '' AS f_balance,
              itemsite_qtyonhand AS balance
         FROM itemsite
        WHERE ((itemsite_item_id=<? value("item_id") ?>)
          AND (itemsite_warehous_id=<? value("warehous_id") ?>))

 ORDER BY r_duedate, sequence;

 --------------------------------------------------------------------
 REPORT: SingleLevelBOM
 QUERY: detail
 SELECT bomitem_seqnumber, item_number,
-       uom_name AS item_invuom, item_descrip1, item_descrip2,
+       invuom.uom_name AS invuomname, issueuom.uom_name AS issueuomname,
+       item_descrip1, item_descrip2,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod,
-       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS qtyper,
+       formatQtyPer(bomitem_qtyper) AS issueqtyper,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS invqtyper,
        formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper) * (1 + bomitem_scrap)) AS qtyreq,
+       formatQtyPer(bomitem_qtyper * (1 + bomitem_scrap)) AS qtyreq,
        formatDate(bomitem_effective, <? value("always") ?>) AS effective,
        formatDate(bomitem_expires, <? value("never") ?>) AS expires,
        bomitem_ecn
 <? if exists("revision_id") ?>
   FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>)
 <? else ?>
   FROM bomitem(<? value("item_id") ?>)
 <? endif ?>
-, item, uom
+, item, uom AS issueuom, uom AS invuom
 WHERE ((bomitem_item_id=item_id)
-AND (item_inv_uom_id=uom_id)
+AND (item_inv_uom_id=invuom.uom_id)
+AND (bomitem_uom_id=issueuom.uom_id)
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
 REPORT: SummarizedSalesByCustomerType
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("custtype_id") ?>
         (SELECT (custtype_code || '-' || custtype_descrip)
            FROM custtype
           WHERE custtype_id=<? value("custtype_id") ?>)
        <? elseif exists("custtype_pattern") ?>
-         text(<? value("custtype_pattern") ?>
+         text(<? value("custtype_pattern") ?>)
        <? else  ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate;

 --------------------------------------------------------------------
 REPORT: WOScheduleByParameterList
 QUERY: Detail
-SELECT formatWONumber(wo_id) AS wonumber,
-       wo_status, warehous_code, item_number, item_descrip1, item_descrip2, uom_name,
-       formatQty(wo_qtyord) AS ordered,
-       formatQty(wo_qtyrcv) AS received,
-       formatDate(wo_startdate) AS startdate,
-       formatDate(wo_duedate) AS duedate
-FROM wo, itemsite, warehous, item, uom
-WHERE ( (wo_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (item_inv_uom_id=uom_id)
- AND (itemsite_warehous_id=warehous_id)
-
-<? if exists("showOnlyRI") ?>
- AND (wo_status IN ('R', 'I'))
-<? else ?>
- AND (wo_status <> 'C')
-<? endif ?>
-
-<? if exists("showOnlyTopLevel") ?>
- AND (wo_ordtype<>'W')
-<? endif ?>
-
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-
-<? if exists("item_id") ?>
- AND (itemsite_item_id=<? value("item_id") ?>)
-<? elseif exists("wo_id") ?>
- AND (wo_number IN (SELECT wo_number
-                    FROM wo
-                    WHERE (wo_id=<? value("wo_id") ?>)))
-<? endif ?>
-
-<? if exists("plancode_id") ?>
- AND (itemsite_plancode_id=<? value("plancode_id") ?>)
-<? elseif exists("plancode_pattern") ?>
- AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
-<? endif ?>
-
-<? if exists("classcode_id") ?>
- AND (item_classcode_id=<? value("classcode_id") ?>)
-<? elseif exists("classcode_pattern") ?>
- AND (item_classcode_id IN (SELECT classcode_id FROM classcode WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
-<? endif ?>
-
-<? if exists("itemgrp_id") ?>
- AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
-<? elseif exists("itemgrp_pattern") ?>
- AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem, itemgrp WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id) AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) )))
-<? endif ?>
-
-<? if exists("wrkcnt_id") ?>
- AND (wo_id IN (SELECT wooper_wo_id FROM wooper WHERE (wooper_wrkcnt_id=<? value("wrkcnt_id") ?>)))
-<? elseif exists("wrkcnt_pattern") ?>
- AND (wo_id IN (SELECT wooper_wo_id FROM wooper, wrkcnt WHERE ( (wooper_wrkcnt_id=wrkcnt_id) AND (wrkcnt_code ~ <? value("wrkcnt_pattern") ?>) )))
-<? endif ?>
-
- AND (wo_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
-ORDER BY
-
-<? if exists("sortByStartDate") ?>
-  wo_startdate,
-<? elseif exists("sortByDueDate") ?>
-  wo_duedate,
-<? elseif exists("sortByItemNumber") ?>
-  item_number,
-<? endif ?>
-
-  wo_number, wo_subnumber;
-
---------------------------------------------------------------------