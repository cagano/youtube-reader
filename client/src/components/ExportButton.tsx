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
    padding: 40,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  heading1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
    marginTop: 24,
  },
  heading2: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 14,
    marginTop: 20,
  },
  heading3: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    marginTop: 16,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  listItemBullet: {
    width: 16,
    marginRight: 8,
  },
  listItemContent: {
    flex: 1,
  },
  codeBlock: {
    fontFamily: 'Courier',
    backgroundColor: '#f5f5f5',
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
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
        const MarkdownH1 = ({ children }) => <Text style={styles.heading1}>{children}</Text>;
        const MarkdownH2 = ({ children }) => <Text style={styles.heading2}>{children}</Text>;
        const MarkdownH3 = ({ children }) => <Text style={styles.heading3}>{children}</Text>;
        const MarkdownParagraph = ({ children }) => <Text style={styles.text}>{children}</Text>;
        const MarkdownBold = ({ children }) => <Text style={styles.bold}>{children}</Text>;
        const MarkdownItalic = ({ children }) => <Text style={styles.italic}>{children}</Text>;
        const MarkdownCode = ({ children }) => <Text style={styles.codeBlock}>{children}</Text>;
        const MarkdownListItem = ({ children }) => (
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
