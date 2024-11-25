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
  section: {
    marginBottom: 10,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Times-Roman, Times, serif',
    marginBottom: 10,
    lineHeight: 1.5,
    color: '#2D3748',
  },
  heading1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold, Arial-Bold, sans-serif',
    marginBottom: 16,
    marginTop: 24,
    lineHeight: 1.2,
    color: '#1A202C',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold, Arial-Bold, sans-serif',
    marginBottom: 14,
    marginTop: 20,
    lineHeight: 1.3,
    color: '#2D3748',
    letterSpacing: -0.3,
  },
  heading3: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold, Arial-Bold, sans-serif',
    marginBottom: 12,
    marginTop: 16,
    lineHeight: 1.4,
    color: '#4A5568',
    letterSpacing: -0.2,
  },
  heading4: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold, Arial-Bold, sans-serif',
    marginBottom: 10,
    marginTop: 14,
    lineHeight: 1.4,
    color: '#4A5568',
    letterSpacing: -0.1,
  },
  bold: {
    fontFamily: 'Helvetica-Bold, Arial-Bold, sans-serif',
    color: '#2D3748',
    letterSpacing: -0.2,
  },
  italic: {
    fontFamily: 'Times-Italic, Times-Roman-Italic, serif',
    color: '#4A5568',
    letterSpacing: 0.2,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  listItemBullet: {
    width: 16,
    marginRight: 8,
    color: '#4A5568',
  },
  listItemContent: {
    flex: 1,
    paddingRight: 16,
  },
  orderedListItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  orderedListItemNumber: {
    width: 24,
    marginRight: 8,
    color: '#4A5568',
  },
  blockquote: {
    backgroundColor: '#F7FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#CBD5E0',
    borderLeftStyle: 'solid',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 12,
    marginHorizontal: 0,
    fontStyle: 'italic',
    color: '#4A5568',
    fontFamily: 'Times-Italic, Times-Roman-Italic, serif',
    letterSpacing: 0.2,
  },
  codeBlock: {
    fontFamily: 'Courier, Courier New, monospace',
    backgroundColor: '#F7FAFC',
    padding: 12,
    marginVertical: 8,
    borderRadius: 4,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    letterSpacing: 0.5,
  },
  inlineCode: {
    fontFamily: 'Courier, Courier New, monospace',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 10,
    color: '#2D3748',
    borderRadius: 2,
    letterSpacing: 0.3,
  },
  link: {
    color: '#3182CE',
    textDecoration: 'underline',
  },
  horizontalRule: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderBottomStyle: 'solid',
    marginVertical: 16,
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
        const MarkdownH1 = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <Text style={styles.heading1}>{children}</Text>
          </View>
        );
        
        const MarkdownH2 = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <Text style={styles.heading2}>{children}</Text>
          </View>
        );
        
        const MarkdownH3 = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <Text style={styles.heading3}>{children}</Text>
          </View>
        );
        
        const MarkdownH4 = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <Text style={styles.heading4}>{children}</Text>
          </View>
        );
        
        const MarkdownParagraph = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <Text style={styles.text}>{children}</Text>
          </View>
        );
        
        const MarkdownBold = ({ children }: { children: React.ReactNode }) => (
          <Text style={styles.bold}>{children}</Text>
        );
        
        const MarkdownItalic = ({ children }: { children: React.ReactNode }) => (
          <Text style={styles.italic}>{children}</Text>
        );
        
        const MarkdownCode = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <Text style={styles.codeBlock}>{children}</Text>
          </View>
        );
        
        const MarkdownInlineCode = ({ children }: { children: React.ReactNode }) => (
          <Text style={styles.inlineCode}>{children}</Text>
        );
        
        const MarkdownListItem = ({ children, ordered, index }: { children: React.ReactNode; ordered?: boolean; index?: number }) => (
          <View style={ordered ? styles.orderedListItem : styles.listItem}>
            <Text style={ordered ? styles.orderedListItemNumber : styles.listItemBullet}>
              {ordered ? `${index}. ` : '• '}
            </Text>
            <Text style={styles.listItemContent}>{children}</Text>
          </View>
        );
        
        const MarkdownBlockquote = ({ children }: { children: React.ReactNode }) => (
          <View style={styles.section}>
            <View style={styles.blockquote}>
              <Text style={[styles.text, { fontStyle: 'italic' }]}>{children}</Text>
            </View>
          </View>
        );
        
        const MarkdownLink = ({ children, href }: { children: React.ReactNode; href?: string }) => (
          <Text style={styles.link}>{children}</Text>
        );
        
        const MarkdownHR = () => (
          <View style={styles.horizontalRule} />
        );

        // Configure markdown options
        const options = {
          overrides: {
            h1: { component: MarkdownH1 },
            h2: { component: MarkdownH2 },
            h3: { component: MarkdownH3 },
            h4: { component: MarkdownH4 },
            p: { component: MarkdownParagraph },
            strong: { component: MarkdownBold },
            em: { component: MarkdownItalic },
            code: { component: MarkdownCode },
            inlineCode: { component: MarkdownInlineCode },
            li: { 
              component: MarkdownListItem,
              props: (props: any) => ({
                ordered: props.ordered,
                index: props.index
              })
            },
            blockquote: { component: MarkdownBlockquote },
            a: { component: MarkdownLink },
            hr: { component: MarkdownHR },
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
