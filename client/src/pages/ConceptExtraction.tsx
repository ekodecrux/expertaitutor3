import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Brain,
  Loader2,
  Sparkles,
  BookOpen,
  Network,
  Trash2,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function ConceptExtraction() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, { status: 'pending' | 'uploading' | 'completed' | 'failed'; error?: string }>>({});
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubject, setSearchSubject] = useState<string | undefined>();
  const [searchDifficulty, setSearchDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | undefined>();
  const [searchCategory, setSearchCategory] = useState<'definition' | 'formula' | 'theorem' | 'principle' | 'fact' | undefined>();
  const [minImportance, setMinImportance] = useState<number | undefined>();
  const [maxImportance, setMaxImportance] = useState<number | undefined>();

  const utils = trpc.useUtils();

  // Queries
  const { data: materials, isLoading: materialsLoading } = trpc.conceptExtraction.getMaterials.useQuery();
  const { data: searchResults, isLoading: searchLoading } = trpc.conceptExtraction.searchConcepts.useQuery(
    {
      query: searchQuery || undefined,
      subject: searchSubject,
      difficulty: searchDifficulty,
      category: searchCategory,
      minImportance,
      maxImportance,
      limit: 50,
      offset: 0,
    },
    { enabled: false } // Only search when user clicks search button
  );
  const { data: concepts, isLoading: conceptsLoading } = trpc.conceptExtraction.getConcepts.useQuery(
    { materialId: selectedMaterialId! },
    { enabled: !!selectedMaterialId }
  );

  // Mutations
  const uploadMutation = trpc.conceptExtraction.uploadMaterial.useMutation({
    onSuccess: (data) => {
      toast.success("Material uploaded successfully!");
      // Automatically start extraction
      extractMutation.mutate({ materialId: data.materialId });
      // Clear form
      setTitle("");
      setDescription("");
      setTextContent("");
      setSubject("");
      setTopic("");
      setCurriculum("");
      utils.conceptExtraction.getMaterials.invalidate();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const extractMutation = trpc.conceptExtraction.extractConcepts.useMutation({
    onSuccess: (data) => {
      toast.success(`Extracted ${data.conceptCount} concepts and ${data.relationshipCount} relationships!`);
      utils.conceptExtraction.getMaterials.invalidate();
      utils.conceptExtraction.getConcepts.invalidate();
    },
    onError: (error) => {
      toast.error(`Extraction failed: ${error.message}`);
      utils.conceptExtraction.getMaterials.invalidate();
    },
  });

  const deleteMutation = trpc.conceptExtraction.deleteMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material deleted successfully");
      setSelectedMaterialId(null);
      utils.conceptExtraction.getMaterials.invalidate();
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const uploadFileMutation = trpc.conceptExtraction.uploadFile.useMutation({
    onSuccess: (data) => {
      toast.success("File uploaded and text extracted successfully!");
      setIsProcessingFile(false);
      // Automatically start extraction
      extractMutation.mutate({ materialId: data.materialId });
      // Clear form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setSubject("");
      setTopic("");
      setCurriculum("");
      utils.conceptExtraction.getMaterials.invalidate();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsProcessingFile(false);
    },
  });

  const uploadBatchMutation = trpc.conceptExtraction.uploadBatchFiles.useMutation({
    onSuccess: (data) => {
      toast.success(`Batch upload complete! ${data.successCount}/${data.totalFiles} files processed successfully`);
      if (data.failureCount > 0) {
        toast.error(`${data.failureCount} files failed to upload`);
      }
      // Clear batch files
      setBatchFiles([]);
      setUploadProgress({});
      utils.conceptExtraction.getMaterials.invalidate();
    },
    onError: (error) => {
      toast.error(`Batch upload failed: ${error.message}`);
    },
  });

  const exportAnkiMutation = trpc.conceptExtraction.exportToAnki.useMutation({
    onSuccess: (data) => {
      toast.success(`Anki deck created with ${data.cardCount} flashcards!`);
      // Download the file
      window.open(data.fileUrl, '_blank');
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const handleUpload = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!textContent.trim()) {
      toast.error("Please enter some content to analyze");
      return;
    }

    uploadMutation.mutate({
      title,
      description,
      fileType: "text",
      textContent,
      subject,
      topic,
      curriculum,
    });
  };

  const handleDelete = (materialId: number) => {
    if (confirm("Are you sure you want to delete this material and all its concepts?")) {
      deleteMutation.mutate({ materialId });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "formula":
        return "🧮";
      case "theorem":
        return "📐";
      case "principle":
        return "⚡";
      case "definition":
        return "📖";
      case "fact":
        return "💡";
      default:
        return "📝";
    }
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Concept Extraction</h1>
            <p className="text-muted-foreground">
              Automatically extract key concepts, definitions, and relationships from your study materials
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Material
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <BookOpen className="h-4 w-4" />
            My Library ({materials?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search Concepts
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Study Material
              </CardTitle>
              <CardDescription>
                Paste your study material text below and let AI extract important concepts automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Newton's Laws of Motion"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="computer_science">Computer Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Classical Mechanics"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curriculum">Curriculum</Label>
                  <Select value={curriculum} onValueChange={setCurriculum}>
                    <SelectTrigger id="curriculum">
                      <SelectValue placeholder="Select curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="IB">IB</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="UCAT">UCAT</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the material..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <Separator />

              {/* Single File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Upload Single PDF or Image</Label>
                  <Badge variant="outline" className="text-xs">OCR Enabled</Badge>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      // Validate file size (16MB)
                      if (file.size > 16 * 1024 * 1024) {
                        toast.error("File size exceeds 16MB limit");
                        return;
                      }
                      
                      setSelectedFile(file);
                      setIsProcessingFile(true);
                      
                      // Convert to base64
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result as string;
                        const base64Data = base64.split(',')[1]; // Remove data:image/png;base64, prefix
                        
                        uploadFileMutation.mutate({
                          title: title || file.name.replace(/\.[^/.]+$/, ""),
                          description,
                          fileBase64: base64Data,
                          fileName: file.name,
                          subject,
                          topic,
                          curriculum,
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-primary" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {isProcessingFile && (
                          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Extracting text...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="font-medium">Click to upload PDF or Image</p>
                        <p className="text-xs text-muted-foreground">
                          Supports PDF, PNG, JPG, GIF, BMP, WebP (Max 16MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Separator />

              {/* Batch Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Batch Upload (Multiple Files)</Label>
                  <Badge variant="outline" className="text-xs">Up to 10 files</Badge>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="batch-upload"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      
                      // Validate file count
                      if (files.length > 10) {
                        toast.error("Maximum 10 files allowed per batch");
                        return;
                      }
                      
                      // Validate file sizes
                      const oversizedFiles = files.filter(f => f.size > 16 * 1024 * 1024);
                      if (oversizedFiles.length > 0) {
                        toast.error(`${oversizedFiles.length} file(s) exceed 16MB limit`);
                        return;
                      }
                      
                      setBatchFiles(files);
                      
                      // Initialize progress tracking
                      const progress: Record<string, { status: 'pending' | 'uploading' | 'completed' | 'failed' }> = {};
                      files.forEach(f => {
                        progress[f.name] = { status: 'pending' };
                      });
                      setUploadProgress(progress);
                      
                      // Convert all files to base64
                      const filePromises = files.map(file => {
                        return new Promise<{ title: string; fileBase64: string; fileName: string }>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64 = reader.result as string;
                            const base64Data = base64.split(',')[1];
                            resolve({
                              title: file.name.replace(/\.[^/.]+$/, ""),
                              fileBase64: base64Data,
                              fileName: file.name,
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                      });
                      
                      const filesData = await Promise.all(filePromises);
                      
                      // Upload batch
                      uploadBatchMutation.mutate({
                        files: filesData.map(f => ({
                          ...f,
                          subject,
                          topic,
                          curriculum,
                        })),
                      });
                    }}
                    className="hidden"
                  />
                  <label htmlFor="batch-upload" className="cursor-pointer">
                    {batchFiles.length > 0 ? (
                      <div className="space-y-3">
                        <FileText className="h-12 w-12 mx-auto text-primary" />
                        <p className="font-medium">{batchFiles.length} files selected</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {batchFiles.map((file, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground flex items-center justify-between px-4">
                              <span>{file.name}</span>
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>
                        {uploadBatchMutation.isPending && (
                          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing batch upload...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="font-medium">Click to upload multiple files</p>
                        <p className="text-xs text-muted-foreground">
                          Select up to 10 PDF or image files (Max 16MB each)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your study material here... (minimum 100 characters for meaningful extraction)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {textContent.length} characters
                </p>
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400">AI-Powered Analysis</p>
                  <p className="text-blue-600/80 dark:text-blue-400/80">
                    Our AI will automatically extract concepts, definitions, relationships, and importance scores
                  </p>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || extractMutation.isPending}
                className="w-full"
                size="lg"
              >
                {uploadMutation.isPending || extractMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadMutation.isPending ? "Uploading..." : "Extracting Concepts..."}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Upload & Extract Concepts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Materials List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Your Materials</CardTitle>
                <CardDescription>Click to view extracted concepts</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {materialsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : materials && materials.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {materials.map((material) => (
                        <div
                          key={material.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedMaterialId === material.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-accent border-border"
                          }`}
                          onClick={() => setSelectedMaterialId(material.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-medium line-clamp-2">{material.title}</h3>
                            {getStatusIcon(material.processingStatus)}
                          </div>
                          {material.subject && (
                            <Badge variant="outline" className="mb-2">
                              {material.subject}
                            </Badge>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{material.conceptCount || 0} concepts</span>
                            <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground">No materials yet</p>
                      <p className="text-xs text-muted-foreground">Upload your first study material to get started</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Concepts View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Extracted Concepts
                    </CardTitle>
                    <CardDescription>
                      {selectedMaterialId
                        ? `Viewing concepts from selected material`
                        : "Select a material to view concepts"}
                    </CardDescription>
                  </div>
                  {selectedMaterialId && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportAnkiMutation.mutate({ materialId: selectedMaterialId })}
                        disabled={exportAnkiMutation.isPending || !concepts || concepts.length === 0}
                      >
                        {exportAnkiMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export to Anki
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedMaterialId)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {!selectedMaterialId ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Eye className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Select a material from the left to view its concepts</p>
                    </div>
                  ) : conceptsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : concepts && concepts.length > 0 ? (
                    <div className="space-y-4">
                      {concepts.map((concept) => (
                        <Card key={concept.id} className="border-l-4" style={{ borderLeftColor: `hsl(${(concept.importanceScore || 50) * 1.2}, 70%, 50%)` }}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getCategoryIcon(concept.category || "")}</span>
                                <div>
                                  <CardTitle className="text-lg">{concept.conceptName}</CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={getDifficultyColor(concept.difficulty || "")}>
                                      {concept.difficulty}
                                    </Badge>
                                    <Badge variant="outline">{concept.category}</Badge>
                                    <Badge variant="secondary">
                                      {concept.importanceScore}/100
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {concept.definition && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Definition</h4>
                                <p className="text-sm text-muted-foreground">{concept.definition}</p>
                              </div>
                            )}
                            {concept.explanation && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Explanation</h4>
                                <p className="text-sm text-muted-foreground">{concept.explanation}</p>
                              </div>
                            )}
                            {concept.examples && Array.isArray(concept.examples) && concept.examples.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Examples</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {concept.examples.map((example, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {concept.keywords && Array.isArray(concept.keywords) && concept.keywords.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Keywords</h4>
                                <div className="flex flex-wrap gap-1">
                                  {concept.keywords.map((keyword, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Brain className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">No concepts extracted yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        The material may still be processing or extraction failed
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Concepts
              </CardTitle>
              <CardDescription>
                Search across all your extracted concepts with advanced filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <div className="flex gap-2">
                  <Input
                    id="search-query"
                    placeholder="Search concept names, definitions, explanations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        utils.conceptExtraction.searchConcepts.refetch();
                      }
                    }}
                  />
                  <Button
                    onClick={() => utils.conceptExtraction.searchConcepts.refetch()}
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-subject">Subject</Label>
                  <Select value={searchSubject} onValueChange={(val) => setSearchSubject(val === 'all' ? undefined : val)}>
                    <SelectTrigger id="search-subject">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-difficulty">Difficulty</Label>
                  <Select value={searchDifficulty} onValueChange={(val) => setSearchDifficulty(val === 'all' ? undefined : val as any)}>
                    <SelectTrigger id="search-difficulty">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-category">Category</Label>
                  <Select value={searchCategory} onValueChange={(val) => setSearchCategory(val === 'all' ? undefined : val as any)}>
                    <SelectTrigger id="search-category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="definition">Definition</SelectItem>
                      <SelectItem value="formula">Formula</SelectItem>
                      <SelectItem value="theorem">Theorem</SelectItem>
                      <SelectItem value="principle">Principle</SelectItem>
                      <SelectItem value="fact">Fact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-importance">Min Importance</Label>
                  <Input
                    id="min-importance"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={minImportance ?? ''}
                    onChange={(e) => setMinImportance(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-importance">Max Importance</Label>
                  <Input
                    id="max-importance"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={maxImportance ?? ''}
                    onChange={(e) => setMaxImportance(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchSubject(undefined);
                      setSearchDifficulty(undefined);
                      setSearchCategory(undefined);
                      setMinImportance(undefined);
                      setMaxImportance(undefined);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Search Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {searchResults ? `${searchResults.total} concepts found` : 'Search results will appear here'}
                  </h3>
                  {searchResults && searchResults.hasMore && (
                    <Badge variant="secondary">Showing first 50 results</Badge>
                  )}
                </div>

                <ScrollArea className="h-[600px] pr-4">
                  {searchLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults && searchResults.concepts.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.concepts.map((concept) => (
                        <Card key={concept.id} className="border-l-4" style={{ borderLeftColor: `hsl(${(concept.importanceScore || 50) * 1.2}, 70%, 50%)` }}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getCategoryIcon(concept.category || "")}</span>
                                <div>
                                  <CardTitle className="text-lg">{concept.conceptName}</CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {concept.difficulty || 'intermediate'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {concept.category || 'concept'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <Sparkles className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-semibold">{concept.importanceScore || 50}/100</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Definition</h4>
                              <p className="text-sm">{concept.definition}</p>
                            </div>
                            {concept.explanation && (
                              <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Explanation</h4>
                                <p className="text-sm text-muted-foreground">{concept.explanation}</p>
                              </div>
                            )}
                            {concept.examples && Array.isArray(concept.examples) && concept.examples.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Examples</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {concept.examples.map((example, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {concept.keywords && Array.isArray(concept.keywords) && concept.keywords.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Keywords</h4>
                                <div className="flex flex-wrap gap-1">
                                  {concept.keywords.map((keyword, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : searchResults ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No concepts found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search filters</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Enter a search query or apply filters</p>
                      <p className="text-xs text-muted-foreground mt-1">Then click the search button to find concepts</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
