"""
Django admin for the learning platform.
Content saved here appears on the site within a few seconds (the catalog cache is cleared on save).
"""

from django.contrib import admin

from .models import Checklist, ExamSession, Question, Section, Syllabus, Topic


class SectionInline(admin.TabularInline):
    model = Section
    extra = 0
    fields = ['name', 'slug', 'is_hub', 'display_order']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Syllabus)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ['short', 'name', 'board_name', 'status', 'display_order']
    list_editable = ['status', 'display_order']
    list_filter = ['board', 'status']
    search_fields = ['name', 'short', 'code', 'slug']
    inlines = [SectionInline]


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'syllabus', 'is_hub', 'display_order']
    list_editable = ['display_order']
    list_filter = ['syllabus', 'is_hub']
    search_fields = ['name', 'slug']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'section', 'tag', 'removed_in', 'question_count', 'display_order', 'is_active']
    list_editable = ['display_order', 'is_active']
    list_filter = ['section__syllabus', 'is_active', 'removed_in']
    search_fields = ['name', 'key', 'slug', 'summary']
    fieldsets = (
        ('Basics', {'fields': ('key', 'section', 'name', 'slug', 'summary', 'tag', 'removed_in', 'video')}),
        ('Notes and cheat sheet', {'fields': ('notes',)}),
        ('Practice', {'fields': ('generators', 'investigation', 'bands')}),
        ('Display', {'fields': ('display_order', 'is_active')}),
    )

    @admin.display(description='Questions')
    def question_count(self, obj):
        return obj.questions.count()


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['key', 'topic', 'difficulty', 'marks', 'calculator', 'criterion', 'has_video', 'is_active']
    list_editable = ['is_active']
    list_filter = ['topic__section__syllabus', 'difficulty', 'calculator', 'criterion', 'is_active']
    search_fields = ['key', 'stem', 'topic__name']
    autocomplete_fields = ['topic']
    fieldsets = (
        ('Basics', {'fields': ('key', 'topic', 'difficulty', 'marks', 'calculator', 'criterion')}),
        ('Question', {'fields': ('stem', 'parts')}),
        ('Solution', {'fields': ('scheme', 'answer', 'video')}),
        ('Display', {'fields': ('display_order', 'is_active')}),
    )

    @admin.display(boolean=True, description='Video')
    def has_video(self, obj):
        return bool(obj.video)


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ['title', 'syllabus', 'paper']
    list_filter = ['syllabus']
    search_fields = ['title', 'slug']


@admin.register(ExamSession)
class ExamSessionAdmin(admin.ModelAdmin):
    list_display = ['name', 'starts', 'approximate']
    list_editable = ['starts', 'approximate']
