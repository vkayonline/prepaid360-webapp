export const escapeCsv = (value: any) => {
    if (value == null) return "";
    const stringValue = String(value);

    if (stringValue.includes(",") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

export const handleDownloadSample = () => {
    const headers = ["kitNumber", "name", "mobile", "email", "amount", "deliverTo", "addressLine1", "addressLine2", "addressLine3", "city", "state", "country", "pincode"];
    const sampleData = ["KIT123456", "Venkatesh Prasath", "9876543210", "venkat@example.com", "500.00", "HOME", "No 12, ABC Street", "2nd Cross", "Near Bus Stand", "Chennai", "Tamil Nadu", "India", "600001"];

    const escapedData = sampleData.map(escapeCsv);
    const csvContent = [headers.join(","), escapedData.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.href) URL.revokeObjectURL(link.href);
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute("download", "bulk_application.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
