package com.networkers.admin;

import com.networkers.user.User;
import com.networkers.user.UserRepository;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class MemberExportService {
    private static final List<String> HEADERS = List.of("Name", "Number", "Email", "Chapter", "Password");
    private static final String PROTECTED_PASSWORD = "Not available (securely hashed)";

    private final UserRepository users;

    public MemberExportService(UserRepository users) {
        this.users = users;
    }

    public byte[] exportMembers() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Members");
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, HEADERS.size() - 1));

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            Row header = sheet.createRow(0);
            for (int column = 0; column < HEADERS.size(); column++) {
                header.createCell(column).setCellValue(HEADERS.get(column));
                header.getCell(column).setCellStyle(headerStyle);
            }

            int rowNumber = 1;
            for (User user : users.findAllBillableMembers()) {
                Row row = sheet.createRow(rowNumber++);
                row.createCell(0).setCellValue(value(user.getFullName()));
                row.createCell(1).setCellValue(value(user.getMobile()));
                row.createCell(2).setCellValue(value(user.getEmail()));
                row.createCell(3).setCellValue(user.getChapter() == null ? "Unassigned" : value(user.getChapter().getChapterName()));
                row.createCell(4).setCellValue(PROTECTED_PASSWORD);
            }

            for (int column = 0; column < HEADERS.size(); column++) {
                sheet.autoSizeColumn(column);
                sheet.setColumnWidth(column, Math.min(sheet.getColumnWidth(column) + 768, 12000));
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not generate the member Excel file", exception);
        }
    }

    private String value(String value) {
        return value == null ? "" : value;
    }
}
