"""
Database Models for Legal Services
Includes: Legislation, Laws, Knowledge Base, News, Library, Branches, and Sections
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import (
    Column, String, Integer, Text, DateTime, Boolean, ForeignKey,
    Table, Float, Enum as SQLEnum, JSON, Index, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class LegalStatus(str, Enum):
    """Enum for legal document status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    REPEALED = "repealed"
    AMENDED = "amended"
    PENDING = "pending"


class DocumentType(str, Enum):
    """Enum for document types"""
    LEGISLATION = "legislation"
    LAW = "law"
    REGULATION = "regulation"
    DECREE = "decree"
    RESOLUTION = "resolution"
    DIRECTIVE = "directive"
    ARTICLE = "article"
    CLAUSE = "clause"


class Priority(str, Enum):
    """Enum for news and knowledge base priority"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Branch(Base):
    """Branch Model - Represents different branches/departments"""
    __tablename__ = "branches"
    __table_args__ = (
        Index('idx_branch_code', 'code'),
        Index('idx_branch_name', 'name'),
    )

    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    head_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sections = relationship("Section", back_populates="branch", cascade="all, delete-orphan")
    legislation = relationship("Legislation", back_populates="branch")
    laws = relationship("Law", back_populates="branch")
    knowledge_bases = relationship("KnowledgeBase", back_populates="branch")
    news_items = relationship("News", back_populates="branch")
    library_items = relationship("LibraryItem", back_populates="branch")

    def __repr__(self):
        return f"<Branch(id={self.id}, code={self.code}, name={self.name})>"


class Section(Base):
    """Section Model - Represents sections within branches"""
    __tablename__ = "sections"
    __table_args__ = (
        Index('idx_section_branch_id', 'branch_id'),
        Index('idx_section_code', 'code'),
        UniqueConstraint('branch_id', 'code', name='uq_branch_section_code'),
    )

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id', ondelete='CASCADE'), nullable=False)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    head_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="sections")
    legislation = relationship("Legislation", back_populates="section")
    laws = relationship("Law", back_populates="section")

    def __repr__(self):
        return f"<Section(id={self.id}, code={self.code}, name={self.name})>"


class Legislation(Base):
    """Legislation Model - Represents legislative documents"""
    __tablename__ = "legislations"
    __table_args__ = (
        Index('idx_legislation_code', 'legislation_code'),
        Index('idx_legislation_status', 'status'),
        Index('idx_legislation_date', 'issued_date'),
        Index('idx_legislation_branch', 'branch_id'),
        Index('idx_legislation_section', 'section_id'),
    )

    id = Column(Integer, primary_key=True)
    legislation_code = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    document_type = Column(SQLEnum(DocumentType), default=DocumentType.LEGISLATION, nullable=False)
    status = Column(SQLEnum(LegalStatus), default=LegalStatus.ACTIVE, nullable=False, index=True)
    issued_date = Column(DateTime, nullable=False, index=True)
    effective_date = Column(DateTime, nullable=True)
    repeal_date = Column(DateTime, nullable=True)
    issuing_authority = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    keywords = Column(JSON, nullable=True)  # Store as JSON array
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=True)
    section_id = Column(Integer, ForeignKey('sections.id'), nullable=True)
    parent_legislation_id = Column(Integer, ForeignKey('legislations.id'), nullable=True)
    version_number = Column(Integer, default=1, nullable=False)
    amendment_notes = Column(Text, nullable=True)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="legislation")
    section = relationship("Section", back_populates="legislation")
    parent_legislation = relationship("Legislation", remote_side=[id], backref="amendments")
    related_laws = relationship("Law", back_populates="related_legislation")

    def __repr__(self):
        return f"<Legislation(id={self.id}, code={self.legislation_code}, title={self.title})>"


class Law(Base):
    """Law Model - Represents legal laws and their details"""
    __tablename__ = "laws"
    __table_args__ = (
        Index('idx_law_code', 'law_code'),
        Index('idx_law_status', 'status'),
        Index('idx_law_date', 'issued_date'),
        Index('idx_law_branch', 'branch_id'),
        Index('idx_law_section', 'section_id'),
    )

    id = Column(Integer, primary_key=True)
    law_code = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    full_text = Column(Text, nullable=True)
    status = Column(SQLEnum(LegalStatus), default=LegalStatus.ACTIVE, nullable=False, index=True)
    issued_date = Column(DateTime, nullable=False, index=True)
    effective_date = Column(DateTime, nullable=True)
    repeal_date = Column(DateTime, nullable=True)
    issuing_authority = Column(String(255), nullable=True)
    jurisdiction = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    articles_count = Column(Integer, nullable=True)
    keywords = Column(JSON, nullable=True)  # Store as JSON array
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=True)
    section_id = Column(Integer, ForeignKey('sections.id'), nullable=True)
    related_legislation_id = Column(Integer, ForeignKey('legislations.id'), nullable=True)
    version_number = Column(Integer, default=1, nullable=False)
    amendment_notes = Column(Text, nullable=True)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="laws")
    section = relationship("Section", back_populates="laws")
    related_legislation = relationship("Legislation", back_populates="related_laws")
    articles = relationship("Article", back_populates="law", cascade="all, delete-orphan")
    clauses = relationship("Clause", back_populates="law", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Law(id={self.id}, code={self.law_code}, title={self.title})>"


class Article(Base):
    """Article Model - Represents articles within laws"""
    __tablename__ = "articles"
    __table_args__ = (
        Index('idx_article_law_id', 'law_id'),
        Index('idx_article_number', 'article_number'),
    )

    id = Column(Integer, primary_key=True)
    law_id = Column(Integer, ForeignKey('laws.id', ondelete='CASCADE'), nullable=False)
    article_number = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    law = relationship("Law", back_populates="articles")
    clauses = relationship("Clause", back_populates="article", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Article(id={self.id}, number={self.article_number}, law_id={self.law_id})>"


class Clause(Base):
    """Clause Model - Represents clauses within articles"""
    __tablename__ = "clauses"
    __table_args__ = (
        Index('idx_clause_law_id', 'law_id'),
        Index('idx_clause_article_id', 'article_id'),
    )

    id = Column(Integer, primary_key=True)
    law_id = Column(Integer, ForeignKey('laws.id', ondelete='CASCADE'), nullable=False)
    article_id = Column(Integer, ForeignKey('articles.id', ondelete='CASCADE'), nullable=True)
    clause_number = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    sub_clauses = Column(JSON, nullable=True)  # Store sub-clauses as JSON
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    law = relationship("Law", back_populates="clauses")
    article = relationship("Article", back_populates="clauses")

    def __repr__(self):
        return f"<Clause(id={self.id}, number={self.clause_number}, law_id={self.law_id})>"


class KnowledgeBase(Base):
    """Knowledge Base Model - Stores legal knowledge and guidelines"""
    __tablename__ = "knowledge_base"
    __table_args__ = (
        Index('idx_kb_category', 'category'),
        Index('idx_kb_status', 'is_active'),
        Index('idx_kb_priority', 'priority'),
        Index('idx_kb_branch', 'branch_id'),
        Index('idx_kb_created_date', 'created_at'),
    )

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)  # Store as JSON array
    keywords = Column(JSON, nullable=True)  # Store as JSON array
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM, nullable=False)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=True)
    related_legislation_ids = Column(JSON, nullable=True)  # Store as JSON array
    related_law_ids = Column(JSON, nullable=True)  # Store as JSON array
    author = Column(String(255), nullable=True)
    source = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    view_count = Column(Integer, default=0)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="knowledge_bases")

    def __repr__(self):
        return f"<KnowledgeBase(id={self.id}, title={self.title}, category={self.category})>"


class News(Base):
    """News Model - Stores legal news and announcements"""
    __tablename__ = "news"
    __table_args__ = (
        Index('idx_news_category', 'category'),
        Index('idx_news_status', 'is_published'),
        Index('idx_news_priority', 'priority'),
        Index('idx_news_branch', 'branch_id'),
        Index('idx_news_published_date', 'published_date'),
        Index('idx_news_created_date', 'created_at'),
    )

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    slug = Column(String(500), unique=True, nullable=True)
    category = Column(String(100), nullable=False)
    tags = Column(JSON, nullable=True)  # Store as JSON array
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM, nullable=False)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=True)
    related_legislation_ids = Column(JSON, nullable=True)  # Store as JSON array
    related_law_ids = Column(JSON, nullable=True)  # Store as JSON array
    featured_image_url = Column(String(500), nullable=True)
    author = Column(String(255), nullable=True)
    source = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, index=True)
    is_featured = Column(Boolean, default=False)
    published_date = Column(DateTime, nullable=True, index=True)
    view_count = Column(Integer, default=0)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="news_items")

    def __repr__(self):
        return f"<News(id={self.id}, title={self.title}, is_published={self.is_published})>"


class LibraryItem(Base):
    """Library Item Model - Stores legal documents, PDFs, and resources"""
    __tablename__ = "library_items"
    __table_args__ = (
        Index('idx_library_category', 'category'),
        Index('idx_library_document_type', 'document_type'),
        Index('idx_library_branch', 'branch_id'),
        Index('idx_library_created_date', 'created_at'),
    )

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    file_mime_type = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)  # Store as JSON array
    keywords = Column(JSON, nullable=True)  # Store as JSON array
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=True)
    related_legislation_ids = Column(JSON, nullable=True)  # Store as JSON array
    related_law_ids = Column(JSON, nullable=True)  # Store as JSON array
    author = Column(String(255), nullable=True)
    source = Column(String(500), nullable=True)
    publication_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    download_count = Column(Integer, default=0)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="library_items")

    def __repr__(self):
        return f"<LibraryItem(id={self.id}, title={self.title}, document_type={self.document_type})>"


# Association table for many-to-many relationships if needed in the future
legislation_knowledge_base = Table(
    'legislation_knowledge_base',
    Base.metadata,
    Column('legislation_id', Integer, ForeignKey('legislations.id', ondelete='CASCADE'), primary_key=True),
    Column('knowledge_base_id', Integer, ForeignKey('knowledge_base.id', ondelete='CASCADE'), primary_key=True),
    Index('idx_legis_kb_legislation', 'legislation_id'),
    Index('idx_legis_kb_kb', 'knowledge_base_id'),
)

law_knowledge_base = Table(
    'law_knowledge_base',
    Base.metadata,
    Column('law_id', Integer, ForeignKey('laws.id', ondelete='CASCADE'), primary_key=True),
    Column('knowledge_base_id', Integer, ForeignKey('knowledge_base.id', ondelete='CASCADE'), primary_key=True),
    Index('idx_law_kb_law', 'law_id'),
    Index('idx_law_kb_kb', 'knowledge_base_id'),
)
