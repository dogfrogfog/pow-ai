"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useCompletion } from "ai/react";
import { useUser } from "@clerk/nextjs";

const programmingLanguages = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "Ruby",
  "Go",
  "Rust",
  "TypeScript",
  "Swift",
  "Kotlin",
];

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
});

// PDF Document component
const PDFDocument = ({ content }: { content: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.text}>{content}</Text>
      </View>
    </Page>
  </Document>
);

export function DocumentCreation({
  saveToRedis,
}: {
  saveToRedis: (
    prompt: string,
    completion: string,
    selectedLanguage: string
  ) => Promise<void>;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  //   const [documentId, setDocumentId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/generate",
    onFinish: async (prompt: string, completion: string) => {
      try {
        const documentId = await saveToRedis(
          prompt,
          completion,
          selectedLanguage
        );
        console.log(`Document saved with ID: ${documentId}`);
      } catch (error) {
        console.error("Error saving document:", error);
        // You might want to show an error message to the user here
      }
    },
  });

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to use this feature.</div>;
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleGenerateDocument = async () => {
    setIsEditing(true);
    await complete(
      `Generate a ${selectedLanguage} document based on this prompt: ${prompt}`
    );
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create New Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select a programming language" />
              </SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for document generation"
            />
          </div>
          {isEditing && (
            <Tabs defaultValue="edit">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Textarea
                  value={completion}
                  onChange={(e) => complete(e.target.value)}
                  rows={15}
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="prose max-w-full border p-4 rounded-md bg-white">
                  <ReactMarkdown>{completion}</ReactMarkdown>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isEditing ? (
          <Button
            onClick={handleGenerateDocument}
            disabled={!selectedLanguage || !prompt || isLoading}
          >
            {isLoading ? "Generating..." : "Generate Document"}
          </Button>
        ) : (
          <>
            <PDFDownloadLink
              document={<PDFDocument content={completion} />}
              fileName={`generated_${selectedLanguage.toLowerCase()}_document.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading}>
                  {loading ? "Loading document..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
