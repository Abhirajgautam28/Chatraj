import React from 'react';
import PropTypes from 'prop-types';
import {
  InsertDriveFile as FileIconDefault,
  Html as HtmlIcon,
  Css as CssIcon,
  Javascript as JavascriptIcon,
  DataObject as DataObjectIcon,
  DataArray as DataArrayIcon,
  Terminal as TerminalIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Storage as StorageIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  FolderZip as FolderZipIcon,
} from '@mui/icons-material';

const FileIcon = ({ fileName }) => {
  const getIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();

    const iconMap = {
      html: <HtmlIcon />,
      css: <CssIcon />,
      scss: <CssIcon />,
      sass: <CssIcon />,
      less: <CssIcon />,
      js: <JavascriptIcon />,
      jsx: <JavascriptIcon />,
      ts: <JavascriptIcon />,
      tsx: <JavascriptIcon />,
      vue: <JavascriptIcon />,
      php: <CodeIcon />,
      py: <CodeIcon />,
      java: <CodeIcon />,
      class: <CodeIcon />,
      jar: <CodeIcon />,
      rs: <CodeIcon />,
      go: <CodeIcon />,
      rb: <CodeIcon />,
      rake: <CodeIcon />,
      pl: <CodeIcon />,
      scala: <CodeIcon />,
      cs: <CodeIcon />,
      fs: <CodeIcon />,
      cpp: <CodeIcon />,
      cc: <CodeIcon />,
      c: <CodeIcon />,
      h: <CodeIcon />,
      hpp: <CodeIcon />,
      json: <DataObjectIcon />,
      yaml: <DataArrayIcon />,
      yml: <DataArrayIcon />,
      xml: <CodeIcon />,
      toml: <DataArrayIcon />,
      ini: <SettingsIcon />,
      env: <VpnKeyIcon />,
      md: <DescriptionIcon />,
      mdx: <DescriptionIcon />,
      txt: <DescriptionIcon />,
      doc: <DescriptionIcon />,
      docx: <DescriptionIcon />,
      pdf: <PictureAsPdfIcon />,
      sql: <StorageIcon />,
      mysql: <StorageIcon />,
      pgsql: <StorageIcon />,
      mongo: <StorageIcon />,
      redis: <StorageIcon />,
      json5: <DataObjectIcon />,
      lock: <LockIcon />,
      yarn: <DataObjectIcon />,
      sh: <TerminalIcon />,
      bash: <TerminalIcon />,
      zsh: <TerminalIcon />,
      bat: <TerminalIcon />,
      ps1: <TerminalIcon />,
      default: <FileIconDefault />,
    };

    const specialFiles = {
        'dockerfile': <TerminalIcon />,
        'package.json': <DataObjectIcon />,
        '.gitignore': <CodeIcon />,
        '.env': <VpnKeyIcon />,
        'readme': <DescriptionIcon />,
        'license': <DescriptionIcon />,
        'makefile': <TerminalIcon />,
    };

    const lowerFileName = fileName.toLowerCase();
    for (const [special, icon] of Object.entries(specialFiles)) {
      if (lowerFileName.includes(special)) {
        return icon;
      }
    }

    return iconMap[ext] || iconMap.default;
  };

  return getIcon(fileName);
};

FileIcon.propTypes = {
  fileName: PropTypes.string.isRequired,
};

export default FileIcon;