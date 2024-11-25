import React from 'react';
import { Save } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

interface ExportButtonProps {
  content: string;
  fileName?: string;
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
});

export function ExportButton({ content, fileName = 'transcript' }: ExportButtonProps) {
  const handleExport = async (format: 'pdf' | 'markdown' | 'txt') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseFileName = `${fileName}-${timestamp}`;

    switch (format) {
      case 'pdf': {
        // Create PDF document
        const MyDocument = () => (
          <Document>
            <Page size="A4" style={styles.page}>
              <Text style={styles.text}>{content}</Text>
            </Page>
          </Document>
        );

        const blob = await pdf(<MyDocument />).toBlob();
        saveAs(blob, `${baseFileName}.pdf`);
        break;
      }
      case 'markdown': {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${baseFileName}.md`);
        break;
      }
      case 'txt': {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${baseFileName}.txt`);
        break;
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200">
          <Save className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')}>
          Export as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
