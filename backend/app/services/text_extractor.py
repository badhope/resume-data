from pathlib import Path
from typing import Optional
import re


class TextExtractor:
    """简历文本提取器"""
    
    def extract(self, file_path: str) -> str:
        """根据文件类型选择提取策略"""
        path = Path(file_path)
        ext = path.suffix.lower()
        
        extractors = {
            '.pdf': self._extract_pdf,
            '.docx': self._extract_docx,
            '.doc': self._extract_doc,
            '.txt': self._extract_txt,
            '.html': self._extract_html,
        }
        
        extractor = extractors.get(ext)
        if not extractor:
            raise ValueError(f"不支持的文件格式: {ext}")
        
        return extractor(file_path)
    
    def _extract_pdf(self, file_path: str) -> str:
        """提取PDF文本"""
        try:
            import fitz
            doc = fitz.open(file_path)
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()
            return "\n".join(text_parts)
        except Exception as e:
            return f"PDF提取失败: {str(e)}"
    
    def _extract_docx(self, file_path: str) -> str:
        """提取Word docx文本"""
        try:
            from docx import Document
            doc = Document(file_path)
            paragraphs = [para.text for para in doc.paragraphs]
            return "\n".join(paragraphs)
        except Exception as e:
            return f"Word文档提取失败: {str(e)}"
    
    def _extract_doc(self, file_path: str) -> str:
        """提取Word doc文本（需要转换）"""
        try:
            import subprocess
            import tempfile
            
            with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp:
                tmp_path = tmp.name
            
            subprocess.run(
                ['soffice', '--headless', '--convert-to', 'docx', '--outdir', 
                 str(Path(file_path).parent), file_path],
                capture_output=True,
                timeout=30
            )
            
            docx_path = str(Path(file_path).with_suffix('.docx'))
            if Path(docx_path).exists():
                return self._extract_docx(docx_path)
            
            return "doc格式转换失败，请转换为docx格式后重试"
        except Exception as e:
            return f"doc格式处理失败: {str(e)}"
    
    def _extract_txt(self, file_path: str) -> str:
        """提取纯文本"""
        try:
            encodings = ['utf-8', 'gbk', 'gb2312', 'latin1']
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        return f.read()
                except UnicodeDecodeError:
                    continue
            return "文本文件编码无法识别"
        except Exception as e:
            return f"文本文件读取失败: {str(e)}"
    
    def _extract_html(self, file_path: str) -> str:
        """提取HTML文本"""
        try:
            from bs4 import BeautifulSoup
            with open(file_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            return soup.get_text(separator='\n', strip=True)
        except Exception as e:
            return f"HTML文件解析失败: {str(e)}"
