'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, FolderKanban, Users, DollarSign, Plus, Eye, Edit, Upload, MapPin, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Institution {
  id: string
  name: string
  type: string
  region: string
  contact_name: string
  status: string
}

interface Project {
  id: string
  title: string
  description: string
  category: string
  status: string
  progress_percentage: number
  budget_approved: number
  budget_spent: number
  beneficiaries_count: number
  members_integrated: number
  location_region: string
  date_start: string
  date_end_planned: string
  institution: {
    id: string
    name: string
    type: string
    region: string
  }
}

interface ProjectProgress {
  id: string
  title: string
  description: string
  progress_type: string
  percentage_after: number
  created_at: string
}

const statusColors: Record<string, string> = {
  planning: 'bg-gray-500',
  approved: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  paused: 'bg-orange-500',
  cancelled: 'bg-red-500'
}

const statusLabels: Record<string, string> = {
  planning: 'Planificación',
  approved: 'Aprobado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  paused: 'Pausado',
  cancelled: 'Cancelado'
}

const categoryLabels: Record<string, string> = {
  education: 'Educación',
  health: 'Salud',
  infrastructure: 'Infraestructura',
  sports: 'Deportes',
  culture: 'Cultura',
  social: 'Social'
}

const institutionTypeLabels: Record<string, string> = {
  governor: 'Gobernación',
  mayor: 'Alcaldía',
  ministry: 'Ministerio'
}

export default function ProjectsAdminPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Form states
  const [showInstitutionDialog, setShowInstitutionDialog] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)

  // Institution form
  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    type: 'governor',
    region: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  })

  // Project form
  const [projectForm, setProjectForm] = useState({
    institution_id: '',
    title: '',
    description: '',
    category: 'education',
    location_region: '',
    budget_approved: '',
    date_start: '',
    date_end_planned: ''
  })

  // Progress form
  const [progressForm, setProgressForm] = useState({
    title: '',
    description: '',
    percentage_after: '',
    progress_type: 'milestone'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [instRes, projRes] = await Promise.all([
        fetch('/api/institutions'),
        fetch('/api/projects')
      ])
      
      const instData = await instRes.json()
      const projData = await projRes.json()
      
      if (instData.success) setInstitutions(instData.institutions)
      if (projData.success) setProjects(projData.projects)
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  const createInstitution = async () => {
    try {
      const res = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institutionForm)
      })
      const data = await res.json()
      if (data.success) {
        setShowInstitutionDialog(false)
        setInstitutionForm({
          name: '',
          type: 'governor',
          region: '',
          contact_name: '',
          contact_phone: '',
          contact_email: ''
        })
        loadData()
      }
    } catch (error) {
      console.error('Error creating institution:', error)
    }
  }

  const createProject = async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectForm,
          budget_approved: parseFloat(projectForm.budget_approved) || 0
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowProjectDialog(false)
        setProjectForm({
          institution_id: '',
          title: '',
          description: '',
          category: 'education',
          location_region: '',
          budget_approved: '',
          date_start: '',
          date_end_planned: ''
        })
        loadData()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const loadProjectDetail = async (project: Project) => {
    setSelectedProject(project)
    try {
      const res = await fetch(`/api/projects/${project.id}/progress`)
      const data = await res.json()
      if (data.success) {
        setProjectProgress(data.progress)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const addProgress = async () => {
    if (!selectedProject) return
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...progressForm,
          percentage_before: selectedProject.progress_percentage,
          percentage_after: parseInt(progressForm.percentage_after) || selectedProject.progress_percentage
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowProgressDialog(false)
        setProgressForm({
          title: '',
          description: '',
          percentage_after: '',
          progress_type: 'milestone'
        })
        loadData()
        loadProjectDetail(selectedProject)
      }
    } catch (error) {
      console.error('Error adding progress:', error)
    }
  }

  // Stats calculations
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget_approved || 0), 0),
    totalSpent: projects.reduce((sum, p) => sum + (p.budget_spent || 0), 0),
    totalBeneficiaries: projects.reduce((sum, p) => sum + (p.beneficiaries_count || 0), 0),
    membersIntegrated: projects.reduce((sum, p) => sum + (p.members_integrated || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-amber-600" />
            Módulo de Proyectos Institucionales
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de obras y contratos con Gobernaciones y Alcaldías
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="institutions">Instituciones</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="transparency">Transparencia</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeProjects} activos, {stats.completedProjects} completados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Ejecutado: ${stats.totalSpent.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Beneficiarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBeneficiaries}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.membersIntegrated} integrados al Club
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{institutions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Gobiernos asociados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Recientes</CardTitle>
                <CardDescription>Últimos proyectos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.slice(0, 5).map(project => (
                  <div key={project.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-gray-500">{project.institution?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress_percentage} className="w-24" />
                      <Badge className={statusColors[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Instituciones Gubernamentales</h2>
              <Dialog open={showInstitutionDialog} onOpenChange={setShowInstitutionDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Institución
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Nueva Institución</DialogTitle>
                    <DialogDescription>
                      Agrega una gobernación, alcaldía o ministerio
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nombre</Label>
                      <Input
                        value={institutionForm.name}
                        onChange={e => setInstitutionForm({...institutionForm, name: e.target.value})}
                        placeholder="Gobernación de Miranda"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipo</Label>
                      <Select value={institutionForm.type} onValueChange={v => setInstitutionForm({...institutionForm, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="governor">Gobernación</SelectItem>
                          <SelectItem value="mayor">Alcaldía</SelectItem>
                          <SelectItem value="ministry">Ministerio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Región</Label>
                      <Input
                        value={institutionForm.region}
                        onChange={e => setInstitutionForm({...institutionForm, region: e.target.value})}
                        placeholder="Miranda"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Persona de Contacto</Label>
                      <Input
                        value={institutionForm.contact_name}
                        onChange={e => setInstitutionForm({...institutionForm, contact_name: e.target.value})}
                        placeholder="Nombre del contacto"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Teléfono de Contacto</Label>
                      <Input
                        value={institutionForm.contact_phone}
                        onChange={e => setInstitutionForm({...institutionForm, contact_phone: e.target.value})}
                        placeholder="+58 412 1234567"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createInstitution} className="bg-amber-600 hover:bg-amber-700">
                      Crear Institución
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {institutions.map(inst => (
                <Card key={inst.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-amber-600" />
                      {inst.name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{institutionTypeLabels[inst.type]}</Badge>
                      {inst.region && <span className="ml-2">{inst.region}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Contacto: {inst.contact_name || 'No asignado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Proyectos: {projects.filter(p => p.institution?.id === inst.id).length}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Proyectos</h2>
              <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proyecto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                    <DialogDescription>
                      Registrar un nuevo proyecto institucional
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid gap-2">
                      <Label>Institución</Label>
                      <Select value={projectForm.institution_id} onValueChange={v => setProjectForm({...projectForm, institution_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar institución" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutions.map(inst => (
                            <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Título del Proyecto</Label>
                      <Input
                        value={projectForm.title}
                        onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                        placeholder="Reparación Escuela Bolívar"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={projectForm.description}
                        onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                        placeholder="Descripción detallada del proyecto..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Categoría</Label>
                      <Select value={projectForm.category} onValueChange={v => setProjectForm({...projectForm, category: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Educación</SelectItem>
                          <SelectItem value="health">Salud</SelectItem>
                          <SelectItem value="infrastructure">Infraestructura</SelectItem>
                          <SelectItem value="sports">Deportes</SelectItem>
                          <SelectItem value="culture">Cultura</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Presupuesto (USD)</Label>
                        <Input
                          type="number"
                          value={projectForm.budget_approved}
                          onChange={e => setProjectForm({...projectForm, budget_approved: e.target.value})}
                          placeholder="50000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Región</Label>
                        <Input
                          value={projectForm.location_region}
                          onChange={e => setProjectForm({...projectForm, location_region: e.target.value})}
                          placeholder="Miranda"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Fecha Inicio</Label>
                        <Input
                          type="date"
                          value={projectForm.date_start}
                          onChange={e => setProjectForm({...projectForm, date_start: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Fecha Fin Planeada</Label>
                        <Input
                          type="date"
                          value={projectForm.date_end_planned}
                          onChange={e => setProjectForm({...projectForm, date_end_planned: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createProject} className="bg-amber-600 hover:bg-amber-700">
                      Crear Proyecto
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {projects.map(project => (
                <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => loadProjectDetail(project)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <Badge className={statusColors[project.status]}>
                            {statusLabels[project.status]}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {project.institution?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {project.location_region}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${project.budget_approved?.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.beneficiaries_count} beneficiarios
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600">{project.progress_percentage}%</div>
                        <Progress value={project.progress_percentage} className="w-32 mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transparency Tab */}
          <TabsContent value="transparency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Portal de Transparencia
                </CardTitle>
                <CardDescription>
                  Resumen público para ciudadanos y medios de comunicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">${stats.totalBudget.toLocaleString()}</div>
                    <p className="text-sm text-gray-600">Inversión Total</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalBeneficiaries}</div>
                    <p className="text-sm text-gray-600">Beneficiarios Directos</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-3xl font-bold text-amber-600">{stats.completedProjects}</div>
                    <p className="text-sm text-gray-600">Obras Completadas</p>
                  </div>
                </div>
                <p className="text-gray-600 text-center">
                  Este módulo permitirá a los ciudadanos ver el estado de las obras públicas 
                  gestionadas por la Asociación Club de La Colmena en convenio con gobiernos locales.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Detail Dialog */}
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  {selectedProject.institution?.name} - {categoryLabels[selectedProject.category]}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6">
                {/* Progress Overview */}
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-amber-600">{selectedProject.progress_percentage}%</div>
                  <Progress value={selectedProject.progress_percentage} className="flex-1" />
                  <Badge className={statusColors[selectedProject.status]}>
                    {statusLabels[selectedProject.status]}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-gray-400" />
                      <div className="font-semibold">${selectedProject.budget_approved?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Presupuesto</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto text-gray-400" />
                      <div className="font-semibold">{selectedProject.beneficiaries_count}</div>
                      <div className="text-xs text-gray-500">Beneficiarios</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-6 w-6 mx-auto text-gray-400" />
                      <div className="font-semibold">{selectedProject.members_integrated}</div>
                      <div className="text-xs text-gray-500">En el Club</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Timeline */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Historial de Avances</h4>
                    <Button 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => setShowProgressDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Avance
                    </Button>
                  </div>
                  
                  {projectProgress.length > 0 ? (
                    <div className="space-y-3">
                      {projectProgress.map(prog => (
                        <div key={prog.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                            {prog.percentage_after}%
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{prog.title}</p>
                            <p className="text-sm text-gray-500">{prog.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(prog.created_at).toLocaleDateString('es-VE')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Sin avances registrados</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Progress Dialog */}
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Avance</DialogTitle>
              <DialogDescription>
                Actualiza el progreso del proyecto
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título del Avance</Label>
                <Input
                  value={progressForm.title}
                  onChange={e => setProgressForm({...progressForm, title: e.target.value})}
                  placeholder="Instalación de techos"
                />
              </div>
              <div className="grid gap-2">
                <Label>Descripción</Label>
                <Textarea
                  value={progressForm.description}
                  onChange={e => setProgressForm({...progressForm, description: e.target.value})}
                  placeholder="Descripción del avance..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Porcentaje de Avance</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={progressForm.percentage_after}
                  onChange={e => setProgressForm({...progressForm, percentage_after: e.target.value})}
                  placeholder="35"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={progressForm.progress_type} onValueChange={v => setProgressForm({...progressForm, progress_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">Hito</SelectItem>
                    <SelectItem value="inspection">Inspección</SelectItem>
                    <SelectItem value="payment">Pago</SelectItem>
                    <SelectItem value="issue">Incidencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addProgress} className="bg-amber-600 hover:bg-amber-700">
                Guardar Avance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
