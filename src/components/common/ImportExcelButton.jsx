import { useRef, useState } from 'react';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { toast } from 'sonner';

/** Contextual import action used directly on the page that owns the imported records. */
export function ImportExcelButton({ module, label = 'Import Excel', onImported }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.imports.file(module, file);
      toast.success(`${result.importedRows} row(s) imported.`);
      if (result.errors?.length) toast.warning(`${result.errors.length} row(s) were rejected. Open the browser console for details.`);
      if (result.errors?.length) console.warn('Import errors:', result.errors);
      onImported?.(result);
    } catch (error) { toast.error(error.response?.data?.message || 'Import failed.'); }
    finally { setUploading(false); }
  };
  const downloadTemplate = async () => {
    try {
      const response = await fetch(api.imports.templateUrl(module), { headers: { Authorization: `Bearer ${localStorage.getItem('orchasp-token') || sessionStorage.getItem('orchasp-token')}` } });
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = `${module}-import-template.xlsx`; link.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Could not download the template.'); }
  };
  return <><input ref={input} className="hidden" type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={upload} /><Button variant="outline" onClick={downloadTemplate}><DownloadOutlinedIcon className="h-4 w-4" />Template</Button><Button variant="outline" disabled={uploading} onClick={() => input.current?.click()}><UploadFileOutlinedIcon className="h-4 w-4" />{uploading ? 'Importing…' : label}</Button></>;
}
