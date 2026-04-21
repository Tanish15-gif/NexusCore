using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Collections.Generic;
using NexusCore.TransactionStatementsDto;
namespace NexusCore.Services
{
    public class PdfStatementService
    {
        // We pass in the User's Name and their Transaction List
        public byte[] GenerateStatement(string accountName, string accountNumber, List<TransactionStatement> transactions)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Element(compose => 
                    {
                        compose.Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("NexusCore Bank").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken2);
                                col.Item().Text("Official Account Statement").FontSize(14).FontColor(Colors.Grey.Medium);
                            });
                            row.ConstantItem(100).AlignRight().Text($"Date: {System.DateTime.Now:MMM dd, yyyy}");
                        });
                    });

                    page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                    {
                        col.Item().Text($"Account Holder: {accountName}").SemiBold();
                        col.Item().Text($"Account Number: {accountNumber}");
                        col.Item().PaddingBottom(10);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(80); // Date
                                columns.RelativeColumn();   // Description
                                columns.ConstantColumn(80); // Amount
                                columns.ConstantColumn(80); // Status
                            });

                            // Table Headers
                            table.Header(header =>
                            {
                                header.Cell().Text("Date").SemiBold();
                                header.Cell().Text("Description").SemiBold();
                                header.Cell().AlignRight().Text("Amount").SemiBold();
                                header.Cell().AlignCenter().Text("Status").SemiBold();
                            });

                            // Loop through the database transactions!
                            foreach (var txn in transactions)
                            {
                                table.Cell().Text(txn.Date.ToString("MM/dd/yyyy"));
                                table.Cell().Text(txn.Description);
                                table.Cell().AlignRight().Text($"Rs. {txn.Amount:F2}");
                                table.Cell().AlignCenter().Text(txn.Status);
                            }
                        });
                    });

                    // 3. THE FOOTER
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                });
            });

            // Turn the drawing into actual PDF bytes!
            return document.GeneratePdf();
        }
    }
}