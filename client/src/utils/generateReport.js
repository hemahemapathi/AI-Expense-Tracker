import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generateReport = (user, summary, expenses) => {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Report", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Name: ${user?.name || ""}   |   Monthly Income: Rs.${(summary?.monthlyIncome || 0).toLocaleString()}`, 14, 20);
  doc.text(`Generated on ${dateStr}`, 196, 20, { align: "right" });

  // Summary Section
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, 40);

  autoTable(doc, {
    startY: 44,
    head: [["Metric", "Value"]],
    body: [
      ["Monthly Income", `Rs.${(summary?.monthlyIncome || 0).toLocaleString()}`],
      ["This Month Spent", `Rs.${(summary?.thisMonthSpent || 0).toLocaleString()}`],
      ["Total Spent (All Time)", `Rs.${(summary?.totalSpent || 0).toLocaleString()}`],
      ["Balance", `Rs.${(summary?.balance || 0).toLocaleString()}`],
      ["Total Transactions", summary?.totalTransactions || 0],
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold" } },
  });

  // Category Breakdown
  const catY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Spending by Category", 14, catY);

  const catData = summary?.byCategory
    ? Object.entries(summary.byCategory).map(([cat, amt]) => [cat, `Rs.${amt.toLocaleString()}`])
    : [];

  autoTable(doc, {
    startY: catY + 4,
    head: [["Category", "Amount"]],
    body: catData.length > 0 ? catData : [["No data", "-"]],
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 9 },
  });

  // Expenses Table
  const expY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("All Transactions", 14, expY);

  const expData = expenses.map((e) => [
    e.title,
    e.category,
    `Rs.${e.amount.toLocaleString()}`,
    new Date(e.date).toLocaleDateString("en-IN"),
    e.note || "-",
  ]);

  autoTable(doc, {
    startY: expY + 4,
    head: [["Title", "Category", "Amount", "Date", "Note"]],
    body: expData.length > 0 ? expData : [["No expenses", "-", "-", "-", "-"]],
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "left" },
      4: { halign: "left" },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${pageCount}  |  ExpenseTracker`, 14, 290);
  }

  doc.save(`expense-report-${now.toISOString().split("T")[0]}.pdf`);
};

export default generateReport;  
