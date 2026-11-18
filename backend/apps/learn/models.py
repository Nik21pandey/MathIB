"""
Models for the learning platform: syllabuses, topics, notes and questions.

Nested content (notes, mark schemes, investigation steps) is stored as JSON in the
same shape the frontend uses, so the catalog API can return it unchanged.
Text fields use $...$ for inline maths and $$...$$ for display maths (KaTeX).
"""

from django.db import models


class Syllabus(models.Model):
    STATUS_CHOICES = [('live', 'Live'), ('soon', 'Coming soon')]

    slug = models.SlugField(max_length=80, unique=True, help_text="URL segment, e.g. igcse-0580")
    board = models.CharField(max_length=40, help_text="Board id, e.g. cambridge or ib")
    board_name = models.CharField(max_length=120, help_text="e.g. Cambridge International")
    code = models.CharField(max_length=40, help_text="e.g. 0580 or AA HL")
    name = models.CharField(max_length=200)
    short = models.CharField(max_length=60, help_text="Short label, e.g. IGCSE 0580")
    level = models.CharField(max_length=40, blank=True, help_text="Daily 5 level id, e.g. igcse-ext")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='live')
    blurb = models.TextField(blank=True)
    papers = models.JSONField(default=list, blank=True, help_text='[{"name", "calc", "duration", "marks"}]')
    versions = models.JSONField(
        null=True, blank=True,
        help_text='Optional syllabus versions for the toggle: [{"id", "label", "detail"}]'
    )
    version_note = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Syllabuses'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.short


class Section(models.Model):
    syllabus = models.ForeignKey(Syllabus, on_delete=models.CASCADE, related_name='sections')
    slug = models.SlugField(max_length=120)
    name = models.CharField(max_length=200)
    blurb = models.TextField(blank=True)
    is_hub = models.BooleanField(default=False, help_text="Highlight as a hub (e.g. the non-calculator sprint hub)")
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'name']
        unique_together = [['syllabus', 'slug']]

    def __str__(self):
        return f"{self.syllabus.short}: {self.name}"


class Topic(models.Model):
    key = models.SlugField(max_length=60, unique=True, help_text="Short stable id used in quiz links, e.g. surds")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='topics')
    slug = models.SlugField(max_length=160, help_text="URL segment, e.g. surds-and-rationalising")
    name = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    tag = models.CharField(max_length=40, blank=True, help_text="Optional badge, e.g. New for 2025")
    removed_in = models.CharField(
        max_length=20, blank=True,
        help_text="Id of the syllabus version this topic is NOT part of (e.g. new)"
    )
    generators = models.JSONField(default=list, blank=True, help_text="Ids of drill generators (see frontend/src/learn/generators.ts)")
    notes = models.JSONField(default=dict, blank=True, help_text='{"points": [], "formulas": [{"label", "tex"}], "gdc": [], "traps": []}')
    investigation = models.JSONField(null=True, blank=True, help_text="Interactive MYP Criterion B task")
    bands = models.JSONField(null=True, blank=True, help_text='Achievement bands: [{"band", "text"}]')
    video = models.URLField(blank=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'name']
        unique_together = [['section', 'slug']]

    def __str__(self):
        return self.name


class Question(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard'), ('exam', 'Exam-style')]
    CRITERION_CHOICES = [('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]

    key = models.SlugField(max_length=20, unique=True, help_text="Short stable id used in worksheet links and QR codes, e.g. su1")
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    marks = models.PositiveIntegerField()
    calculator = models.BooleanField(default=True, help_text="Untick for non-calculator questions")
    stem = models.TextField()
    parts = models.JSONField(default=list, blank=True, help_text='[{"label": "a", "text": "...", "marks": 2}]')
    scheme = models.JSONField(default=list, help_text='[{"mark": "M1", "text": "..."}]')
    answer = models.TextField(blank=True)
    video = models.URLField(blank=True, help_text="Link to the video solution")
    criterion = models.CharField(max_length=1, choices=CRITERION_CHOICES, blank=True, help_text="MYP criterion, if any")
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['topic', 'display_order', 'id']

    def __str__(self):
        return f"{self.key}: {self.stem[:60]}"

    @property
    def slug(self):
        """Descriptive URL slug. The frontend only needs the trailing key to find the question."""
        return f"{self.topic.slug}-{self.difficulty}-{self.key}"


class Checklist(models.Model):
    slug = models.SlugField(max_length=120, unique=True)
    syllabus = models.ForeignKey(Syllabus, on_delete=models.CASCADE, related_name='checklists')
    paper = models.CharField(max_length=120)
    title = models.CharField(max_length=200)
    items = models.JSONField(default=list, help_text='[{"text": "...", "topic": "surds", "minutes": 5}]')

    class Meta:
        ordering = ['syllabus', 'paper']

    def __str__(self):
        return self.title


class ExamSession(models.Model):
    key = models.SlugField(max_length=40, unique=True)
    name = models.CharField(max_length=120)
    starts = models.DateField(help_text="First day of written exams")
    approximate = models.BooleanField(default=True, help_text="Untick once the board has published the final timetable")

    class Meta:
        ordering = ['starts']

    def __str__(self):
        return self.name
