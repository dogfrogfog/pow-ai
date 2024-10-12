"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Document {
  id: string;
  prompt: string;
  completion: string;
  language: string;
  createdAt: string;
}

interface DocumentManagementProps {
  deleteDocument: (documentId: string) => Promise<void>;
  initialDocuments: Document[];
}

export function DocumentManagement({
  deleteDocument,
  initialDocuments,
}: DocumentManagementProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [sortBy, setSortBy] = useState<"createdAt" | "language">("createdAt");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const sortedAndFilteredDocuments = documents
    .filter(
      (doc) =>
        filterLanguage === "all" ||
        doc.language.toLowerCase() === filterLanguage
    )
    .filter(
      (doc) =>
        doc.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.completion.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "createdAt") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return a.language.localeCompare(b.language);
      }
    });

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Select
          onValueChange={(value) =>
            setSortBy(value as "createdAt" | "language")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="language">Language</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setFilterLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {/* Add language options here */}
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            {/* Add more language options as needed */}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search documents"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredDocuments.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.language} Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Prompt: {doc.prompt}</p>
              <p>Created: {new Date(doc.createdAt).toLocaleDateString()}</p>
              <Button
                onClick={() => handleDelete(doc.id)}
                variant="destructive"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
