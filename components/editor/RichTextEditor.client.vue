<template>
  <div class="rich-editor border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded text-sm font-bold w-8 h-8 flex items-center justify-center"
        title="In đậm"
      >B</button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded text-sm italic w-8 h-8 flex items-center justify-center"
        title="In nghiêng"
      >I</button>
      <div class="w-px bg-gray-300 mx-0.5 self-stretch"></div>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded text-xs font-bold w-8 h-8 flex items-center justify-center"
        title="Tiêu đề lớn"
      >H2</button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded text-xs font-bold w-8 h-8 flex items-center justify-center"
        title="Tiêu đề nhỏ"
      >H3</button>
      <div class="w-px bg-gray-300 mx-0.5 self-stretch"></div>
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded w-8 h-8 flex items-center justify-center"
        title="Danh sách gạch đầu dòng"
      >
        <Icon name="ph:list-bullets-bold" class="text-sm" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded w-8 h-8 flex items-center justify-center"
        title="Danh sách đánh số"
      >
        <Icon name="ph:list-numbers-bold" class="text-sm" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
        class="p-1.5 rounded w-8 h-8 flex items-center justify-center"
        title="Trích dẫn"
      >
        <Icon name="ph:quotes-bold" class="text-sm" />
      </button>
      <div class="w-px bg-gray-300 mx-0.5 self-stretch"></div>
      <button
        type="button"
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="p-1.5 rounded w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
        title="Đường kẻ ngang"
      >
        <Icon name="ph:minus-bold" class="text-sm" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        class="p-1.5 rounded w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        title="Hoàn tác"
      >
        <Icon name="ph:arrow-counter-clockwise-bold" class="text-sm" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        class="p-1.5 rounded w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        title="Làm lại"
      >
        <Icon name="ph:arrow-clockwise-bold" class="text-sm" />
      </button>
    </div>

    <!-- Editor content -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [StarterKit],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'focus:outline-none',
    },
  },
})

// Sync khi modelValue thay đổi từ bên ngoài
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val || '', false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.rich-editor .ProseMirror {
  min-height: 200px;
  outline: none;
}
.rich-editor .ProseMirror h2 { font-size: 1.3rem; font-weight: 700; margin: 1em 0 0.5em; }
.rich-editor .ProseMirror h3 { font-size: 1.1rem; font-weight: 700; margin: 1em 0 0.5em; }
.rich-editor .ProseMirror p { margin: 0.5em 0; }
.rich-editor .ProseMirror ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
.rich-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
.rich-editor .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; color: #6b7280; margin: 0.5em 0; }
.rich-editor .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 1em 0; }
.rich-editor .ProseMirror strong { font-weight: 700; }
.rich-editor .ProseMirror em { font-style: italic; }
.rich-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
