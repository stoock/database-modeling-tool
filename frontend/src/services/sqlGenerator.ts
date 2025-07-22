import type { Table, Column, Index, ExportFormat } from '../types';

/**
 * SQL 스크립트 생성 유틸리티
 */
export class SqlGenerator {
  /**
   * 테이블에 대한 CREATE TABLE 문 생성
   */
  static generateCreateTable(table: Table, includeComments: boolean = true): string {
    let sql = '';
    
    // 테이블 주석
    if (includeComments && table.description) {
      sql += `-- ${table.description}\n`;
    }
    
    sql += `CREATE TABLE [${table.name}] (\n`;
    
    // 컬럼 정의
    const columnDefs = table.columns.map(column => {
      let columnDef = `  [${column.name}] ${this.formatDataType(column)}`;
      
      // NULL 허용 여부
      columnDef += column.isNullable ? ' NULL' : ' NOT NULL';
      
      // 자동 증가
      if (column.isIdentity) {
        const seed = column.identitySeed || 1;
        const increment = column.identityIncrement || 1;
        columnDef += ` IDENTITY(${seed},${increment})`;
      }
      
      // 기본값
      if (column.defaultValue) {
        columnDef += ` DEFAULT ${column.defaultValue}`;
      }
      
      // 컬럼 주석
      if (includeComments && column.description) {
        columnDef += ` -- ${column.description}`;
      }
      
      return columnDef;
    });
    
    sql += columnDefs.join(',\n');
    
    // 기본키 제약조건
    const primaryKeyColumns = table.columns.filter(c => c.isPrimaryKey);
    if (primaryKeyColumns.length > 0) {
      const pkColumnNames = primaryKeyColumns.map(c => `[${c.name}]`).join(', ');
      sql += `,\n  CONSTRAINT [PK_${table.name}] PRIMARY KEY CLUSTERED (${pkColumnNames})`;
    }
    
    sql += '\n);\n';
    
    return sql;
  }
  
  /**
   * 인덱스에 대한 CREATE INDEX 문 생성
   */
  static generateCreateIndex(table: Table, index: Index): string {
    let sql = '';
    
    const uniqueStr = index.isUnique ? 'UNIQUE ' : '';
    const indexType = index.type === 'CLUSTERED' ? 'CLUSTERED' : 'NONCLUSTERED';
    
    sql += `CREATE ${uniqueStr}${indexType} INDEX [${index.name}] ON [${table.name}] (`;
    
    // 인덱스 컬럼
    const indexColumns = index.columns.map(ic => {
      const column = table.columns.find(c => c.id === ic.columnId);
      if (!column) return '';
      return `[${column.name}] ${ic.order}`;
    }).filter(Boolean);
    
    sql += indexColumns.join(', ');
    sql += ');\n';
    
    return sql;
  }
  
  /**
   * 데이터 타입 포맷팅
   */
  private static formatDataType(column: Column): string {
    let typeStr = column.dataType;
    
    if (column.maxLength && ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR'].includes(column.dataType)) {
      typeStr += `(${column.maxLength})`;
    } else if (column.precision && ['DECIMAL', 'NUMERIC'].includes(column.dataType)) {
      typeStr += `(${column.precision}${column.scale ? `,${column.scale}` : ''})`;
    }
    
    return typeStr;
  }
  
  /**
   * 전체 스키마 SQL 스크립트 생성
   */
  static generateSchemaScript(
    tables: Table[],
    includeComments: boolean = true,
    includeIndexes: boolean = true
  ): string {
    let sql = '';
    
    // 헤더 주석
    if (includeComments) {
      sql += '-- --------------------------------------------------------\n';
      sql += `-- MSSQL 데이터베이스 스키마 스크립트\n`;
      sql += `-- 생성 날짜: ${new Date().toLocaleString()}\n`;
      sql += `-- 테이블 수: ${tables.length}\n`;
      sql += '-- --------------------------------------------------------\n\n';
    }
    
    // 테이블 생성 스크립트
    tables.forEach(table => {
      if (includeComments) {
        sql += '-- --------------------------------------------------------\n';
        sql += `-- 테이블 구조: ${table.name}\n`;
        sql += '-- --------------------------------------------------------\n\n';
      }
      
      sql += this.generateCreateTable(table, includeComments);
      sql += '\n';
      
      // 인덱스 생성 스크립트
      if (includeIndexes && table.indexes.length > 0) {
        if (includeComments) {
          sql += `-- 테이블 ${table.name}의 인덱스\n`;
        }
        
        table.indexes.forEach(index => {
          sql += this.generateCreateIndex(table, index);
        });
        
        sql += '\n';
      }
    });
    
    return sql;
  }
  
  /**
   * 다양한 형식으로 스키마 내보내기
   */
  static exportSchema(
    tables: Table[],
    format: ExportFormat,
    includeComments: boolean = true,
    includeIndexes: boolean = true,
    includeConstraints: boolean = true
  ): { content: string; mimeType: string } {
    switch (format) {
      case 'SQL':
        return {
          content: this.generateSchemaScript(tables, includeComments, includeIndexes),
          mimeType: 'application/sql'
        };
        
      case 'JSON':
        return {
          content: JSON.stringify(
            tables.map(table => ({
              name: table.name,
              description: table.description,
              columns: table.columns.map(column => ({
                name: column.name,
                dataType: column.dataType,
                maxLength: column.maxLength,
                precision: column.precision,
                scale: column.scale,
                isNullable: column.isNullable,
                isPrimaryKey: column.isPrimaryKey,
                isIdentity: column.isIdentity,
                identitySeed: column.identitySeed,
                identityIncrement: column.identityIncrement,
                defaultValue: column.defaultValue,
                description: column.description
              })),
              indexes: includeIndexes ? table.indexes : []
            })),
            null,
            2
          ),
          mimeType: 'application/json'
        };
        
      case 'MARKDOWN':
        return {
          content: this.generateMarkdownSchema(tables, includeComments, includeIndexes),
          mimeType: 'text/markdown'
        };
        
      case 'HTML':
        return {
          content: this.generateHtmlSchema(tables, includeComments, includeIndexes),
          mimeType: 'text/html'
        };
        
      case 'CSV':
        return {
          content: this.generateCsvSchema(tables),
          mimeType: 'text/csv'
        };
        
      default:
        return {
          content: this.generateSchemaScript(tables, includeComments, includeIndexes),
          mimeType: 'text/plain'
        };
    }
  }
  
  /**
   * 마크다운 형식으로 스키마 생성
   */
  private static generateMarkdownSchema(
    tables: Table[],
    includeComments: boolean = true,
    includeIndexes: boolean = true
  ): string {
    let md = '# 데이터베이스 스키마 문서\n\n';
    
    if (includeComments) {
      md += `생성 날짜: ${new Date().toLocaleString()}\n\n`;
      md += `테이블 수: ${tables.length}\n\n`;
    }
    
    md += '## 목차\n\n';
    tables.forEach(table => {
      md += `- [${table.name}](#${table.name.toLowerCase()})\n`;
    });
    md += '\n';
    
    tables.forEach(table => {
      md += `## ${table.name}\n\n`;
      
      if (includeComments && table.description) {
        md += `${table.description}\n\n`;
      }
      
      md += '### 컬럼\n\n';
      md += '| 이름 | 데이터 타입 | NULL 허용 | 기본키 | 자동증가 | 기본값 | 설명 |\n';
      md += '| ---- | ---------- | -------- | ------ | -------- | ------ | ---- |\n';
      
      table.columns.forEach(column => {
        const dataType = this.formatDataType(column);
        const isNullable = column.isNullable ? 'Y' : 'N';
        const isPrimaryKey = column.isPrimaryKey ? 'Y' : 'N';
        const isIdentity = column.isIdentity ? 'Y' : 'N';
        const defaultValue = column.defaultValue || '';
        const description = column.description || '';
        
        md += `| ${column.name} | ${dataType} | ${isNullable} | ${isPrimaryKey} | ${isIdentity} | ${defaultValue} | ${description} |\n`;
      });
      
      if (includeIndexes && table.indexes.length > 0) {
        md += '\n### 인덱스\n\n';
        md += '| 이름 | 타입 | 유니크 | 컬럼 |\n';
        md += '| ---- | ---- | ------ | ---- |\n';
        
        table.indexes.forEach(index => {
          const indexType = index.type;
          const isUnique = index.isUnique ? 'Y' : 'N';
          
          const indexColumns = index.columns.map(ic => {
            const column = table.columns.find(c => c.id === ic.columnId);
            if (!column) return '';
            return `${column.name} ${ic.order}`;
          }).filter(Boolean).join(', ');
          
          md += `| ${index.name} | ${indexType} | ${isUnique} | ${indexColumns} |\n`;
        });
      }
      
      md += '\n';
    });
    
    return md;
  }
  
  /**
   * HTML 형식으로 스키마 생성
   */
  private static generateHtmlSchema(
    tables: Table[],
    includeComments: boolean = true,
    includeIndexes: boolean = true
  ): string {
    let html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>데이터베이스 스키마 문서</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1 { color: #2c3e50; }
    h2 { color: #3498db; margin-top: 30px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    h3 { color: #2980b9; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .toc { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .toc ul { list-style-type: none; padding-left: 20px; }
    .toc a { text-decoration: none; color: #3498db; }
    .toc a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>데이터베이스 스키마 문서</h1>
`;
    
    if (includeComments) {
      html += `  <p>생성 날짜: ${new Date().toLocaleString()}</p>\n`;
      html += `  <p>테이블 수: ${tables.length}</p>\n`;
    }
    
    html += '  <div class="toc">\n';
    html += '    <h2>목차</h2>\n';
    html += '    <ul>\n';
    tables.forEach(table => {
      html += `      <li><a href="#${table.name}">${table.name}</a></li>\n`;
    });
    html += '    </ul>\n';
    html += '  </div>\n\n';
    
    tables.forEach(table => {
      html += `  <h2 id="${table.name}">${table.name}</h2>\n`;
      
      if (includeComments && table.description) {
        html += `  <p>${table.description}</p>\n`;
      }
      
      html += '  <h3>컬럼</h3>\n';
      html += '  <table>\n';
      html += '    <tr>\n';
      html += '      <th>이름</th>\n';
      html += '      <th>데이터 타입</th>\n';
      html += '      <th>NULL 허용</th>\n';
      html += '      <th>기본키</th>\n';
      html += '      <th>자동증가</th>\n';
      html += '      <th>기본값</th>\n';
      html += '      <th>설명</th>\n';
      html += '    </tr>\n';
      
      table.columns.forEach(column => {
        const dataType = this.formatDataType(column);
        const isNullable = column.isNullable ? 'Y' : 'N';
        const isPrimaryKey = column.isPrimaryKey ? 'Y' : 'N';
        const isIdentity = column.isIdentity ? 'Y' : 'N';
        const defaultValue = column.defaultValue || '';
        const description = column.description || '';
        
        html += '    <tr>\n';
        html += `      <td>${column.name}</td>\n`;
        html += `      <td>${dataType}</td>\n`;
        html += `      <td>${isNullable}</td>\n`;
        html += `      <td>${isPrimaryKey}</td>\n`;
        html += `      <td>${isIdentity}</td>\n`;
        html += `      <td>${defaultValue}</td>\n`;
        html += `      <td>${description}</td>\n`;
        html += '    </tr>\n';
      });
      
      html += '  </table>\n';
      
      if (includeIndexes && table.indexes.length > 0) {
        html += '  <h3>인덱스</h3>\n';
        html += '  <table>\n';
        html += '    <tr>\n';
        html += '      <th>이름</th>\n';
        html += '      <th>타입</th>\n';
        html += '      <th>유니크</th>\n';
        html += '      <th>컬럼</th>\n';
        html += '    </tr>\n';
        
        table.indexes.forEach(index => {
          const indexType = index.type;
          const isUnique = index.isUnique ? 'Y' : 'N';
          
          const indexColumns = index.columns.map(ic => {
            const column = table.columns.find(c => c.id === ic.columnId);
            if (!column) return '';
            return `${column.name} ${ic.order}`;
          }).filter(Boolean).join(', ');
          
          html += '    <tr>\n';
          html += `      <td>${index.name}</td>\n`;
          html += `      <td>${indexType}</td>\n`;
          html += `      <td>${isUnique}</td>\n`;
          html += `      <td>${indexColumns}</td>\n`;
          html += '    </tr>\n';
        });
        
        html += '  </table>\n';
      }
    });
    
    html += '</body>\n</html>';
    
    return html;
  }
  
  /**
   * CSV 형식으로 스키마 생성
   */
  private static generateCsvSchema(tables: Table[]): string {
    let csv = 'Table,Column,DataType,Nullable,PrimaryKey,Identity,DefaultValue,Description\n';
    
    tables.forEach(table => {
      table.columns.forEach(column => {
        const dataType = this.formatDataType(column);
        const isNullable = column.isNullable ? 'Y' : 'N';
        const isPrimaryKey = column.isPrimaryKey ? 'Y' : 'N';
        const isIdentity = column.isIdentity ? 'Y' : 'N';
        const defaultValue = column.defaultValue ? `"${column.defaultValue}"` : '';
        const description = column.description ? `"${column.description}"` : '';
        
        csv += `"${table.name}","${column.name}","${dataType}",${isNullable},${isPrimaryKey},${isIdentity},${defaultValue},${description}\n`;
      });
    });
    
    return csv;
  }
}

export default SqlGenerator;