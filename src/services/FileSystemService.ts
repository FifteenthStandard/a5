import createExternalPageSource from './ExternalPageSourceService';
import { FileSystemClient } from '../clients/FileSystemClient';

export const FileSystemService = createExternalPageSource('FileSystemService', FileSystemClient);
