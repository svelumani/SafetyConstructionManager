import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload, Download, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// Sample CSV format
const SAMPLE_CSV = `firstName,lastName,email,phone,jobTitle,department,role
John,Doe,john.doe@example.com,1234567890,Foreman,Construction,supervisor
Jane,Smith,jane.smith@example.com,0987654321,Engineer,Design,employee
Robert,Johnson,robert.johnson@example.com,5551234567,Contractor,External,subcontractor`;

// Default password for all users
const DEFAULT_PASSWORD = "SafetyFirst123!";

interface UserBulkUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProcessStatus = {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: string[];
};

export function UserBulkUpload({ open, onOpenChange }: UserBulkUploadProps) {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ProcessStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    errors: []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCsvData("");
      setStatus({
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        errors: []
      });
      setIsProcessing(false);
      setActiveTab("upload");
    }
    onOpenChange(newOpen);
  };

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    }
  };

  // Parse CSV data
  const parseCSV = (data: string) => {
    // Handle different line break formats
    const normalizedData = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedData.split('\n');
    
    // Get headers from the first line
    const headers = lines[0].split(',').map(h => h.trim());
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      
      // Skip lines with wrong number of columns
      if (values.length < headers.length) {
        console.log(`Skipping invalid line ${i+1}: not enough columns`);
        continue;
      }
      
      const entry: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      // Make sure required fields exist
      if (!entry.firstName || !entry.lastName || !entry.email) {
        console.log(`Skipping invalid line ${i+1}: missing required fields`);
        continue;
      }
      
      result.push(entry);
    }
    
    console.log('Parsed CSV data:', result);
    return result;
  };

  // Create individual user
  const createUser = async (userData: any) => {
    try {
      // Validate required fields
      if (!userData.email || !userData.firstName || !userData.lastName) {
        throw new Error(`Missing required fields for user: ${JSON.stringify(userData)}`);
      }
      
      // Generate username from email (before @ symbol)
      const username = userData.email.split('@')[0];
      
      // Prepare user data with proper defaults
      const formattedUserData = {
        username,
        password: DEFAULT_PASSWORD,
        email: userData.email.trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        role: userData.role?.trim() || 'employee',
        phone: userData.phone?.trim() || '',
        jobTitle: userData.jobTitle?.trim() || '',
        department: userData.department?.trim() || ''
      };
      
      console.log("Sending user data to API:", formattedUserData);
      
      const response = await apiRequest("POST", "/api/users", formattedUserData);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create user");
      }
      
      return responseData;
    } catch (error: any) {
      console.error("User creation error details:", error);
      throw new Error(`Error creating user ${userData.email || 'unknown'}: ${error.message}`);
    }
  };

  // Process all users
  const processBulkUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No data to process",
        description: "Please upload a CSV file or paste CSV data first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const users = parseCSV(csvData);
      
      if (users.length === 0) {
        toast({
          title: "No valid users found",
          description: "Please check your CSV format and make sure it contains valid user data.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      // Setup the status tracking
      setStatus({
        total: users.length,
        processed: 0,
        success: 0,
        failed: 0,
        errors: []
      });
      
      // Process each user sequentially
      for (const user of users) {
        try {
          console.log("Processing user:", user);
          await createUser(user);
          
          setStatus(prev => ({
            ...prev,
            processed: prev.processed + 1,
            success: prev.success + 1
          }));
        } catch (error: any) {
          console.error("Error creating user:", error);
          
          setStatus(prev => ({
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1,
            errors: [...prev.errors, error.message]
          }));
        }
      }
      
      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      if (status.success > 0) {
        toast({
          title: "Bulk upload completed",
          description: `Successfully added ${status.success} of ${status.total} users.`,
          variant: status.failed > 0 ? "destructive" : "default",
        });
      } else {
        toast({
          title: "Bulk upload failed",
          description: "No users were created. Please check the error messages.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast({
        title: "Error processing CSV",
        description: "Failed to parse the CSV data. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setActiveTab("results");
    }
  };

  // Download sample CSV
  const downloadSample = () => {
    const element = document.createElement("a");
    const file = new Blob([SAMPLE_CSV], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = "sample_users.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
          <DialogDescription>
            Import multiple users at once by uploading a CSV file or pasting CSV data.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="results" disabled={!isProcessing && status.processed === 0}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 py-4">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>CSV Format</AlertTitle>
              <AlertDescription>
                Your CSV should include headers: firstName, lastName, email, phone, jobTitle, department, role.
                <Button variant="link" className="h-auto p-0 ml-1" onClick={downloadSample}>
                  Download sample CSV
                </Button>
              </AlertDescription>
            </Alert>
            
            <div 
              className={`border-2 border-dashed rounded-md p-8 text-center ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="mb-4 text-sm text-muted-foreground">
                <label htmlFor="csv-upload" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                  Click to upload
                </label> or drag and drop your CSV file here
                <input 
                  id="csv-upload" 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="csv-data">Or paste CSV data directly:</Label>
              <Textarea 
                id="csv-data" 
                value={csvData} 
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="firstName,lastName,email,phone,jobTitle,department,role"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 py-4">
            {isProcessing && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{status.processed} of {status.total}</span>
                </div>
                <Progress value={(status.processed / status.total) * 100} />
              </div>
            )}
            
            {status.processed > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{status.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{status.success}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{status.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {status.errors.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Upload Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="text-sm list-disc pl-4 mt-2 max-h-[200px] overflow-y-auto">
                          {status.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <Alert className="mb-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            All users created will have the password: {DEFAULT_PASSWORD}
          </AlertDescription>
        </Alert>
        
        <DialogFooter className="gap-2 sticky bottom-0 pb-2 pt-2 bg-background border-t mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={processBulkUpload}
            disabled={isProcessing || !csvData.trim()}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <AlertCircle className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Process Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}