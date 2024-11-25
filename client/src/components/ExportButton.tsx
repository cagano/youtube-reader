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
import { Document, Page, Text, StyleSheet, View } from '@react-pdf/renderer';
import Markdown from 'markdown-to-jsx';

interface ExportButtonProps {
  content: string;
  fileName?: string;
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  text: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  heading1: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    marginTop: 18,
    lineHeight: 1.3,
  },
  heading2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    marginTop: 16,
    lineHeight: 1.3,
  },
  heading3: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 12,
    lineHeight: 1.3,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 12,
  },
  listItemBullet: {
    width: 12,
    marginRight: 6,
  },
  listItemContent: {
    flex: 1,
  },
  codeBlock: {
    fontFamily: 'Courier',
    backgroundColor: '#f5f5f5',
    padding: 6,
    marginVertical: 6,
    borderRadius: 3,
    fontSize: 9,
    lineHeight: 1.3,
  },
});

export function ExportButton({ content, fileName = 'transcript' }: ExportButtonProps) {
  const handleExport = async (format: 'pdf' | 'markdown' | 'txt') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseFileName = `${fileName}-${timestamp}`;

    switch (format) {
      case 'pdf': {
        // Create PDF document
        // Custom components for markdown elements
        const MarkdownH1 = ({ children }: { children: React.ReactNode }) => <Text style={styles.heading1}>{children}</Text>;
        const MarkdownH2 = ({ children }: { children: React.ReactNode }) => <Text style={styles.heading2}>{children}</Text>;
        const MarkdownH3 = ({ children }: { children: React.ReactNode }) => <Text style={styles.heading3}>{children}</Text>;
        const MarkdownParagraph = ({ children }: { children: React.ReactNode }) => <Text style={styles.text}>{children}</Text>;
        const MarkdownBold = ({ children }: { children: React.ReactNode }) => <Text style={styles.bold}>{children}</Text>;
        const MarkdownItalic = ({ children }: { children: React.ReactNode }) => <Text style={styles.italic}>{children}</Text>;
        const MarkdownCode = ({ children }: { children: React.ReactNode }) => <Text style={styles.codeBlock}>{children}</Text>;
        const MarkdownListItem = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemBullet}>• </Text>
            <Text style={styles.listItemContent}>{children}</Text>
          </View>
        );

        // Configure markdown options
        const options = {
          overrides: {
            h1: { component: MarkdownH1 },
            h2: { component: MarkdownH2 },
            h3: { component: MarkdownH3 },
            p: { component: MarkdownParagraph },
            strong: { component: MarkdownBold },
            em: { component: MarkdownItalic },
            code: { component: MarkdownCode },
            li: { component: MarkdownListItem },
          },
        };

        const MyDocument = () => (
          <Document>
            <Page size="A4" style={styles.page}>
              <Markdown options={options}>{content}</Markdown>
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
