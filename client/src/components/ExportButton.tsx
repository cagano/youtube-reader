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
    marginBottom: 12,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Times-Roman, Times, Georgia, serif',
    marginBottom: 12,
    lineHeight: 1.6,
    color: '#2D3748',
    letterSpacing: 0.2,
  },
  heading1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold, Arial-Bold, system-ui, sans-serif',
    marginBottom: 20,
    marginTop: 28,
    lineHeight: 1.3,
    color: '#1A202C',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold, Arial-Bold, system-ui, sans-serif',
    marginBottom: 16,
    marginTop: 24,
    lineHeight: 1.4,
    color: '#2D3748',
    letterSpacing: -0.3,
  },
  heading3: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold, Arial-Bold, system-ui, sans-serif',
    marginBottom: 14,
    marginTop: 20,
    lineHeight: 1.5,
    color: '#4A5568',
    letterSpacing: -0.2,
  },
  heading4: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold, Arial-Bold, system-ui, sans-serif',
    marginBottom: 12,
    marginTop: 16,
    lineHeight: 1.5,
    color: '#4A5568',
    letterSpacing: -0.1,
  },
  bold: {
    fontFamily: 'Helvetica-Bold, Arial-Bold, system-ui, sans-serif',
    color: '#2D3748',
    letterSpacing: -0.2,
    fontWeight: 'bold',
  },
  italic: {
    fontFamily: 'Times-Italic, Times, Georgia-Italic, serif',
    color: '#4A5568',
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 24,
    alignItems: 'flex-start',
  },
  listItemBullet: {
    width: 20,
    marginRight: 10,
    color: '#4A5568',
    fontSize: 11,
    lineHeight: 1.6,
  },
  listItemContent: {
    flex: 1,
    paddingRight: 24,
    lineHeight: 1.6,
  },
  orderedListItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 24,
    alignItems: 'flex-start',
  },
  orderedListItemNumber: {
    width: 28,
    marginRight: 10,
    color: '#4A5568',
    fontSize: 11,
    lineHeight: 1.6,
  },
  blockquote: {
    backgroundColor: '#F7FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#CBD5E0',
    borderLeftStyle: 'solid',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 16,
    marginHorizontal: 0,
    fontStyle: 'italic',
    color: '#4A5568',
    fontFamily: 'Times-Italic, Times, Georgia-Italic, serif',
    letterSpacing: 0.2,
    lineHeight: 1.6,
  },
  codeBlock: {
    fontFamily: 'Courier, Monaco, Consolas, monospace',
    backgroundColor: '#F8FAFC',
    padding: 16,
    marginVertical: 12,
    borderRadius: 6,
    fontSize: 10,
    lineHeight: 1.6,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    letterSpacing: 0.5,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  inlineCode: {
    fontFamily: 'Courier, Monaco, Consolas, monospace',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    color: '#2D3748',
    borderRadius: 3,
    letterSpacing: 0.3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
