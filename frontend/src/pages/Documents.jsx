import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentsAPI, internsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Search,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Filter,
  Cloud,
  CheckCircle,
  X,
  GripVertical,
  LayoutGrid,
  List,
  Folder
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const typeColors = {
  'CV': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Contrat': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'Rapport': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'Certificat': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'Autre': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const getFileIcon = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return FileImage;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  if (['zip', 'rar', '7z'].includes(ext)) return FileArchive;
  return FileText;
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function Documents() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    type: 'CV',
    intern: '',
  });
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'category'
  const [activeDocument, setActiveDocument] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, internsRes] = await Promise.all([
        documentsAPI.getAll(),
        internsAPI.getAll(),
      ]);
      setDocuments(docsRes.data.documents || []);
      setInterns(internsRes.data.interns || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setUploadFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', uploadData.type);
        if (uploadData.intern) {
          formData.append('intern', uploadData.intern);
        }

        await documentsAPI.upload(formData);
      }
      
      toast.success(`${uploadFiles.length} fichier(s) téléchargé(s) avec succès`);
      setOpenUpload(false);
      setUploadFiles([]);
      setUploadData({ type: 'CV', intern: '' });
      fetchData();
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsAPI.delete(id);
      toast.success('Document deleted');
      fetchData();
    } catch (error) {
      toast.error(t('errorOccurred'));
    }
  };

  const handleDragStart = (event) => {
    const doc = documents.find(d => d._id === event.active.id);
    setActiveDocument(doc);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDocument(null);

    if (!over) return;

    // If dropped on a category, update the document type
    const categoryId = over.id;
    if (Object.keys(typeColors).includes(categoryId)) {
      const docId = active.id;
      const doc = documents.find(d => d._id === docId);
      
      if (doc && doc.type !== categoryId) {
        // Optimistically update UI
        setDocuments(prev => prev.map(d => 
          d._id === docId ? { ...d, type: categoryId } : d
        ));
        toast.success(`Document moved to ${categoryId}`);
        // In production, you would call an API to update the document type
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.intern?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.intern?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getDocumentsByType = (type) => filteredDocuments.filter(d => d.type === type);

  // Sortable Document Card Component
  const SortableDocumentCard = ({ doc }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: doc._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const FileIcon = getFileIcon(doc.fileName);

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="group hover:shadow-lg transition-all bg-card" data-testid={`document-card-${doc._id}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0 relative">
                  <FileIcon size={24} className="text-brand-600 dark:text-brand-300" />
                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={14} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate mb-1" title={doc.fileName}>
                  {doc.fileName}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${typeColors[doc.type]} border-0 text-xs`}>
                    {doc.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(doc.fileSize)}
                  </span>
                </div>
                {doc.intern && (
                  <p className="text-sm text-muted-foreground">
                    {doc.intern.firstName} {doc.intern.lastName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(doc.createdAt).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="flex-1">
                <Eye size={16} className="mr-2" />
                View
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Download size={16} className="mr-2" />
                Download
              </Button>
              {['Admin', 'HR'].includes(user?.role) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDelete(doc._id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Droppable Category Component
  const DroppableCategory = ({ type, documents: categoryDocs }) => {
    const { setNodeRef, isOver } = useSortable({ id: type });

    return (
      <div 
        ref={setNodeRef}
        className={`p-4 rounded-xl border-2 border-dashed transition-all ${
          isOver ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-border'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Folder size={20} className="text-muted-foreground" />
          <Badge className={`${typeColors[type]} border-0`}>{type}</Badge>
          <span className="text-sm text-muted-foreground">({categoryDocs.length})</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <SortableContext items={categoryDocs.map(d => d._id)} strategy={rectSortingStrategy}>
            {categoryDocs.map((doc) => (
              <SortableDocumentCard key={doc._id} doc={doc} />
            ))}
          </SortableContext>
          {categoryDocs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Drop documents here
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="documents-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">{t('documents')}</h1>
          <p className="text-muted-foreground">{t('documentManagement')}</p>
        </div>
        {['Admin', 'HR', 'Manager'].includes(user?.role) && (
          <Button 
            className="bg-brand-600 hover:bg-brand-700" 
            onClick={() => setOpenUpload(true)}
            data-testid="upload-document-button"
          >
            <Upload size={18} className="mr-2" />
            {t('uploadDocument')}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <FileText size={20} className="text-brand-600 dark:text-brand-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{documents.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        {Object.keys(typeColors).map(type => (
          <Card key={type} className="bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <Badge className={`${typeColors[type]} border-0`}>{type}</Badge>
              <span className="text-lg font-semibold text-foreground">
                {documents.filter(d => d.type === type).length}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
            data-testid="search-documents-input"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="filter-type-select">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.keys(typeColors).map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setViewMode('grid')}
            data-testid="view-grid"
          >
            <LayoutGrid size={18} />
          </Button>
          <Button 
            variant={viewMode === 'category' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setViewMode('category')}
            data-testid="view-category"
          >
            <Folder size={18} />
          </Button>
        </div>
      </div>

      {/* Documents View */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {filteredDocuments.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="py-16 text-center">
              <Cloud size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No documents found</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here or click "Upload"
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SortableContext items={filteredDocuments.map(d => d._id)} strategy={rectSortingStrategy}>
              {filteredDocuments.map((doc) => (
                <SortableDocumentCard key={doc._id} doc={doc} />
              ))}
            </SortableContext>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.keys(typeColors).map(type => (
              <DroppableCategory 
                key={type} 
                type={type} 
                documents={getDocumentsByType(type)} 
              />
            ))}
          </div>
        )}

        <DragOverlay>
          {activeDocument ? (
            <Card className="shadow-xl bg-card border-2 border-brand-500 rotate-3 w-80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-brand-600" />
                  <div>
                    <h4 className="font-medium text-foreground truncate">{activeDocument.fileName}</h4>
                    <Badge className={`${typeColors[activeDocument.type]} border-0 text-xs`}>
                      {activeDocument.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Upload Modal with Drag & Drop */}
      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Télécharger des documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                  : 'border-border hover:border-brand-400 hover:bg-muted/50'
              }`}
              data-testid="dropzone"
            >
              <input {...getInputProps()} />
              <Upload size={40} className={`mx-auto mb-4 ${isDragActive ? 'text-brand-500' : 'text-muted-foreground'}`} />
              {isDragActive ? (
                <p className="text-brand-600 font-medium">Déposez les fichiers ici...</p>
              ) : (
                <>
                  <p className="text-foreground font-medium mb-1">
                    Glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOC, DOCX, XLS, XLSX, Images (max 10 MB)
                  </p>
                </>
              )}
            </div>

            {/* Selected Files */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Fichiers sélectionnés ({uploadFiles.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Type */}
            <div>
              <Label>Type de document</Label>
              <Select value={uploadData.type} onValueChange={(value) => setUploadData({ ...uploadData, type: value })}>
                <SelectTrigger data-testid="upload-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(typeColors).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Intern Association */}
            <div>
              <Label>Associer à un stagiaire (optionnel)</Label>
              <Select value={uploadData.intern} onValueChange={(value) => setUploadData({ ...uploadData, intern: value })}>
                <SelectTrigger data-testid="upload-intern-select">
                  <SelectValue placeholder="Aucun stagiaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {interns.map((intern) => (
                    <SelectItem key={intern._id} value={intern._id}>
                      {intern.firstName} {intern.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={uploadFiles.length === 0 || uploading}
              className="w-full bg-brand-600 hover:bg-brand-700"
              data-testid="confirm-upload-button"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Télécharger {uploadFiles.length > 0 && `(${uploadFiles.length})`}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
