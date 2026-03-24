<template>
  <div class="neu-editor-page">
    <!-- Toolbar -->
    <div class="neu-editor-toolbar">
      <div class="neu-editor-toolbar-section">
        <RouterLink :to="backUrl" class="neu-editor-back">
          ← Назад
        </RouterLink>
        <h1 class="neu-editor-title">{{ pageTitle }}</h1>
      </div>
      <div class="neu-editor-actions">
        <button class="neu-btn neu-btn--default" @click="preview">
          👁️ Предпросмотр
        </button>
        <button class="neu-btn neu-btn--primary" @click="save">
          💾 Сохранить
        </button>
      </div>
    </div>

    <div :class="['neu-editor-layout', { 'neu-editor-layout--full': isIssue }]">
      <!-- Main Editor -->
      <div class="neu-editor-main">
        <!-- Редактор номеров -->
        <div v-if="isIssue" class="neu-editor-card">
          <h2 class="neu-editor-section-title">📋 Параметры номера</h2>

          <div class="neu-editor-form">
            <div class="neu-editor-form-row neu-editor-form-row--four">
              <div class="neu-editor-form-group neu-editor-form-group--small">
                <label class="neu-editor-label">Номер *</label>
                <input v-model="form.num" type="number" required class="neu-editor-input" placeholder="5" />
              </div>

              <div class="neu-editor-form-group neu-editor-form-group--small">
                <label class="neu-editor-label">Сквозной</label>
                <input v-model="form.serial" type="number" class="neu-editor-input neu-editor-input--readonly" readonly />
              </div>

              <div class="neu-editor-form-group neu-editor-form-group--small">
                <label class="neu-editor-label">Месяц *</label>
                <select v-model="form.month" required class="neu-editor-input">
                  <option value="январь">Январь</option>
                  <option value="февраль">Февраль</option>
                  <option value="март">Март</option>
                  <option value="апрель">Апрель</option>
                  <option value="май">Май</option>
                  <option value="июнь">Июнь</option>
                  <option value="июль">Июль</option>
                  <option value="август">Август</option>
                  <option value="сентябрь">Сентябрь</option>
                  <option value="октябрь">Октябрь</option>
                  <option value="ноябрь">Ноябрь</option>
                  <option value="декабрь">Декабрь</option>
                </select>
              </div>

              <div class="neu-editor-form-group neu-editor-form-group--small">
                <label class="neu-editor-label">Год</label>
                <input v-model="form.year" type="number" class="neu-editor-input neu-editor-input--readonly" readonly />
              </div>
            </div>

            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Тема номера</label>
              <input v-model="form.theme" type="text" class="neu-editor-input" placeholder="Весеннее обострение" />
            </div>
          </div>
        </div>

        <!-- Предпросмотр обложки -->
        <div v-if="isIssue" class="neu-editor-card neu-editor-card--cover-preview">
          <h2 class="neu-editor-section-title">📖 Предпросмотр обложки</h2>

          <CoverPreview
            :cover-video-url="form.coverVideoUrl"
            :cover-image-url="form.coverImageUrl"
            :num="form.num || 'X'"
            :serial="form.serial || 'XXX'"
            :month="form.month || 'МЕСЯЦ'"
            :year="form.year || 'ГОД'"
            :theme="form.theme || ''"
          />

          <!-- Загрузка видео/изображения -->
          <div class="neu-cover-upload">
            <label class="neu-cover-upload__label">
              <span class="neu-cover-upload__icon">🎬</span>
              <span>Загрузить видео (MP4)</span>
              <input type="file" accept="video/mp4" @change="handleVideoUpload" class="neu-cover-upload__input" />
            </label>
            <label class="neu-cover-upload__label">
              <span class="neu-cover-upload__icon">🖼️</span>
              <span>Загрузить изображение</span>
              <input type="file" accept="image/*" @change="handleImageUpload" class="neu-cover-upload__input" />
            </label>
            <div v-if="uploadingCover" class="neu-cover-upload__status">
              <span class="iconify animate-spin" data-icon="lucide:loader"></span>
              <span>Загрузка...</span>
            </div>
            <div v-if="coverUploadError" class="neu-cover-upload__error">
              {{ coverUploadError }}
            </div>
          </div>
        </div>

        <!-- Над номером работали -->
        <div v-if="isIssue" class="neu-editor-card">
          <h2 class="neu-editor-section-title">👥 Над номером работали</h2>

          <div class="neu-team-list">
            <div v-for="(person, index) in form.team" :key="index" class="neu-team-item">
              <div class="neu-team-item-fields">
                <input v-model="person.name" type="text" class="neu-editor-input" placeholder="Имя Фамилия" />
                <input v-model="person.role" type="text" class="neu-editor-input" placeholder="Должность (напр. Редактор)" />
              </div>
              <button type="button" class="neu-btn neu-btn--danger" @click="removeTeamMember(index)" title="Удалить">
                🗑️
              </button>
            </div>
          </div>

          <button type="button" class="neu-btn neu-btn--default neu-btn--add" @click="addTeamMember">
            + Добавить сотрудника
          </button>

          <p class="neu-editor-hint">Добавьте всех, кто участвовал в создании номера</p>
        </div>

        <!-- Редактор статей -->
        <div v-if="isArticle" class="neu-editor-card">
          <h2 class="neu-editor-section-title">📋 Основное</h2>

          <div class="neu-editor-form">
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Заголовок *</label>
              <input v-model="form.title" type="text" class="neu-editor-input" placeholder="Введите заголовок" />
            </div>

            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Подзаголовок</label>
              <input v-model="form.subtitle" type="text" class="neu-editor-input" placeholder="Подзаголовок или примечание" />
            </div>
          </div>
        </div>

        <div v-if="isArticle" class="neu-editor-card">
          <h2 class="neu-editor-section-title">📖 Контент</h2>
          
          <!-- Main Toolbar -->
          <div class="neu-editor-toolbar-rich">
            <!-- Undo/Redo -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="execCmd('undo')" class="neu-editor-tool-btn" title="Отменить (Ctrl+Z)">
                <span class="iconify" data-icon="lucide:undo"></span>
              </button>
              <button type="button" @click="execCmd('redo')" class="neu-editor-tool-btn" title="Повторить (Ctrl+Y)">
                <span class="iconify" data-icon="lucide:redo"></span>
              </button>
            </div>
            
            <!-- Font Family -->
            <div class="neu-editor-toolbar-group">
              <select @change="execCmd('fontName', $event.target.value)" class="neu-editor-select" title="Шрифт">
                <option value="">Шрифт</option>
                <option value="PT Serif">PT Serif</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="PT Sans">PT Sans</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            
            <!-- Font Size -->
            <div class="neu-editor-toolbar-group">
              <select @change="execCmd('fontSize', $event.target.value)" class="neu-editor-select" title="Размер">
                <option value="">Размер</option>
                <option value="1">Мелкий (8pt)</option>
                <option value="2">Обычный (10pt)</option>
                <option value="3">Средний (12pt)</option>
                <option value="4">Крупный (14pt)</option>
                <option value="5">Большой (18pt)</option>
                <option value="6">Огромный (24pt)</option>
                <option value="7">Гигантский (36pt)</option>
              </select>
            </div>
            
            <!-- Text Formatting -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="execCmd('bold')" class="neu-editor-tool-btn" title="Жирный (Ctrl+B)">
                <span class="iconify" data-icon="lucide:bold"></span>
              </button>
              <button type="button" @click="execCmd('italic')" class="neu-editor-tool-btn" title="Курсив (Ctrl+I)">
                <span class="iconify" data-icon="lucide:italic"></span>
              </button>
              <button type="button" @click="execCmd('underline')" class="neu-editor-tool-btn" title="Подчёркнутый (Ctrl+U)">
                <span class="iconify" data-icon="lucide:underline"></span>
              </button>
              <button type="button" @click="execCmd('strikeThrough')" class="neu-editor-tool-btn" title="Зачёркнутый">
                <span class="iconify" data-icon="lucide:strikethrough"></span>
              </button>
            </div>
            
            <!-- Text Color -->
            <div class="neu-editor-toolbar-group">
              <div class="neu-editor-color-picker">
                <input type="color" @input="execCmd('foreColor', $event.target.value)" class="neu-editor-color-input" title="Цвет текста" />
                <span class="iconify" data-icon="lucide:palette"></span>
              </div>
              <div class="neu-editor-color-picker">
                <input type="color" @input="execCmd('hiliteColor', $event.target.value)" class="neu-editor-color-input" title="Цвет фона" />
                <span class="iconify" data-icon="lucide:highlighter"></span>
              </div>
            </div>
            
            <!-- Headings -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="execCmd('formatBlock', 'h1')" class="neu-editor-tool-btn" title="Заголовок H1">
                <span class="neu-editor-tool-text">H1</span>
              </button>
              <button type="button" @click="execCmd('formatBlock', 'h2')" class="neu-editor-tool-btn" title="Заголовок H2">
                <span class="neu-editor-tool-text">H2</span>
              </button>
              <button type="button" @click="execCmd('formatBlock', 'h3')" class="neu-editor-tool-btn" title="Заголовок H3">
                <span class="neu-editor-tool-text">H3</span>
              </button>
              <button type="button" @click="execCmd('formatBlock', 'p')" class="neu-editor-tool-btn" title="Параграф">
                <span class="neu-editor-tool-text">¶</span>
              </button>
            </div>
            
            <!-- Lists -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="execCmd('insertUnorderedList')" class="neu-editor-tool-btn" title="Маркированный список">
                <span class="iconify" data-icon="lucide:list"></span>
              </button>
              <button type="button" @click="execCmd('insertOrderedList')" class="neu-editor-tool-btn" title="Нумерованный список">
                <span class="iconify" data-icon="lucide:list-ordered"></span>
              </button>
              <button type="button" @click="execCmd('indent')" class="neu-editor-tool-btn" title="Увеличить отступ">
                <span class="iconify" data-icon="lucide:indent"></span>
              </button>
              <button type="button" @click="execCmd('outdent')" class="neu-editor-tool-btn" title="Уменьшить отступ">
                <span class="iconify" data-icon="lucide:outdent"></span>
              </button>
            </div>
            
            <!-- Alignment -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="execCmd('justifyLeft')" class="neu-editor-tool-btn" title="По левому краю">
                <span class="iconify" data-icon="lucide:align-left"></span>
              </button>
              <button type="button" @click="execCmd('justifyCenter')" class="neu-editor-tool-btn" title="По центру">
                <span class="iconify" data-icon="lucide:align-center"></span>
              </button>
              <button type="button" @click="execCmd('justifyRight')" class="neu-editor-tool-btn" title="По правому краю">
                <span class="iconify" data-icon="lucide:align-right"></span>
              </button>
              <button type="button" @click="execCmd('justifyFull')" class="neu-editor-tool-btn" title="По ширине">
                <span class="iconify" data-icon="lucide:align-justify"></span>
              </button>
            </div>
            
            <!-- Blocks -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="execCmd('formatBlock', 'blockquote')" class="neu-editor-tool-btn" title="Цитата">
                <span class="iconify" data-icon="lucide:quote"></span>
              </button>
              <button type="button" @click="execCmd('formatBlock', 'pre')" class="neu-editor-tool-btn" title="Код">
                <span class="iconify" data-icon="lucide:code"></span>
              </button>
              <button type="button" @click="insertHorizontalRule" class="neu-editor-tool-btn" title="Горизонтальная линия">
                <span class="iconify" data-icon="lucide:minus"></span>
              </button>
            </div>
            
            <!-- Insert -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="insertImage" class="neu-editor-tool-btn neu-editor-tool-btn--primary" title="Вставить изображение">
                <span class="iconify" data-icon="lucide:image"></span>
              </button>
              <button type="button" @click="insertLink" class="neu-editor-tool-btn" title="Вставить ссылку">
                <span class="iconify" data-icon="lucide:link"></span>
              </button>
              <button type="button" @click="unlink" class="neu-editor-tool-btn" title="Удалить ссылку">
                <span class="iconify" data-icon="lucide:unlink"></span>
              </button>
              <button type="button" @click="insertTable" class="neu-editor-tool-btn" title="Вставить таблицу">
                <span class="iconify" data-icon="lucide:table"></span>
              </button>
            </div>
            
            <!-- Image Tools -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="imageAlign('left')" class="neu-editor-tool-btn" title="Изображение слева">
                <span class="iconify" data-icon="lucide:image"></span>
                <span class="neu-editor-tool-sub">←</span>
              </button>
              <button type="button" @click="imageAlign('center')" class="neu-editor-tool-btn" title="Изображение по центру">
                <span class="iconify" data-icon="lucide:image"></span>
                <span class="neu-editor-tool-sub">⬌</span>
              </button>
              <button type="button" @click="imageAlign('right')" class="neu-editor-tool-btn" title="Изображение справа">
                <span class="iconify" data-icon="lucide:image"></span>
                <span class="neu-editor-tool-sub">→</span>
              </button>
            </div>
            
            <!-- Image Size -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="imageSize('small')" class="neu-editor-tool-btn" title="Маленькое (200px)">
                <span class="neu-editor-tool-text">S</span>
              </button>
              <button type="button" @click="imageSize('medium')" class="neu-editor-tool-btn" title="Среднее (400px)">
                <span class="neu-editor-tool-text">M</span>
              </button>
              <button type="button" @click="imageSize('large')" class="neu-editor-tool-btn" title="Большое (600px)">
                <span class="neu-editor-tool-text">L</span>
              </button>
              <button type="button" @click="imageSize('full')" class="neu-editor-tool-btn" title="На всю ширину">
                <span class="neu-editor-tool-text">XL</span>
              </button>
            </div>
            
            <!-- Image Style -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="imageStyle('rounded')" class="neu-editor-tool-btn" title="Скруглённые углы">
                <span class="iconify" data-icon="lucide:square"></span>
              </button>
              <button type="button" @click="imageStyle('border')" class="neu-editor-tool-btn" title="Рамка">
                <span class="iconify" data-icon="lucide:square-dashed"></span>
              </button>
              <button type="button" @click="imageStyle('shadow')" class="neu-editor-tool-btn" title="Тень">
                <span class="iconify" data-icon="lucide:drop-shadow"></span>
              </button>
              <button type="button" @click="imageCaption" class="neu-editor-tool-btn" title="Добавить подпись">
                <span class="iconify" data-icon="lucide:caption"></span>
              </button>
            </div>
            
            <!-- Special -->
            <div class="neu-editor-toolbar-group">
              <button type="button" @click="insertSpecialChar" class="neu-editor-tool-btn" title="Спецсимвол">
                <span class="iconify" data-icon="lucide:omega"></span>
              </button>
              <button type="button" @click="removeFormat" class="neu-editor-tool-btn" title="Очистить форматирование">
                <span class="iconify" data-icon="lucide:eraser"></span>
              </button>
              <button type="button" @click="printContent" class="neu-editor-tool-btn" title="Печать">
                <span class="iconify" data-icon="lucide:printer"></span>
              </button>
            </div>
          </div>
          
          <!-- Editor Content -->
          <div 
            class="neu-editor-content" 
            contenteditable="true" 
            @input="updateContent"
            @keydown.ctrl.k.prevent="insertLink"
            @keydown.ctrl.b.prevent="execCmd('bold')"
            @keydown.ctrl.i.prevent="execCmd('italic')"
            v-html="form.body"
          ></div>
          
          <!-- Status Bar -->
          <div class="neu-editor-status-bar">
            <span class="neu-editor-status-item">Слов: {{ wordCount }}</span>
            <span class="neu-editor-status-item">Символов: {{ charCount }}</span>
            <span class="neu-editor-status-item">Полос: ~{{ pageCount }}</span>
            <span class="neu-editor-status-item neu-editor-status-item--right">Ctrl+B — жирный, Ctrl+I — курсив, Ctrl+K — ссылка</span>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside v-if="isArticle" class="neu-editor-sidebar">
        <div class="neu-editor-card">
          <h2 class="neu-editor-section-title">⚙️ Параметры</h2>
          
          <div v-if="isArticle" class="neu-editor-form">
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Автор *</label>
              <select v-model="form.authorId" class="neu-editor-input">
                <option value="">Выбрать автора...</option>
                <option v-for="author in authors" :key="author.id" :value="author.id">
                  {{ author.name }}
                </option>
              </select>
            </div>
            
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Номер *</label>
              <select v-model="form.issueId" class="neu-editor-input">
                <option value="">Выбрать номер...</option>
                <option v-for="issue in issues" :key="issue.id" :value="issue.id">
                  № {{ issue.num }} — {{ issue.month }} {{ issue.year }}
                </option>
              </select>
            </div>
            
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Раздел *</label>
              <select v-model="form.section" class="neu-editor-input">
                <option value="prose">Проза</option>
                <option value="poetry">Поэзия</option>
                <option value="essays">Эссе</option>
              </select>
            </div>
            
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Рубрика</label>
              <input v-model="form.rubric" type="text" class="neu-editor-input" />
            </div>
            
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Жанр</label>
              <select v-model="form.genre" class="neu-editor-input">
                <option value="">Выбрать жанр...</option>
                <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            
            <div class="neu-editor-form-group">
              <label class="neu-editor-label">Свой жанр</label>
              <input v-model="form.customGenre" type="text" class="neu-editor-input" />
            </div>
          </div>
        </div>

        <!-- Статистика для статей -->
        <div v-if="isArticle" class="neu-editor-card">
          <h2 class="neu-editor-section-title">📊 Статистика</h2>
          <div class="neu-editor-stats">
            <div class="neu-stat-row">
              <span class="neu-stat-label">Слов:</span>
              <span class="neu-stat-value">{{ wordCount }}</span>
            </div>
            <div class="neu-stat-row">
              <span class="neu-stat-label">Символов:</span>
              <span class="neu-stat-value">{{ charCount }}</span>
            </div>
            <div class="neu-stat-row">
              <span class="neu-stat-label">Полос (~):</span>
              <span class="neu-stat-value">{{ pageCount }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Image Upload Modal -->
    <div v-if="showImageModal" class="neu-modal-backdrop neu-modal-backdrop--active" @click="showImageModal = false">
      <div class="neu-modal-box neu-modal-box--lg" @click.stop>
        <button class="neu-modal-close" @click="showImageModal = false">✕</button>
        <div class="neu-modal-body">
          <h3 class="neu-modal-title">🖼️ Вставить изображение</h3>
          
          <div class="neu-image-upload-tabs">
            <button 
              :class="['neu-image-tab', imageTab === 'url' ? 'neu-image-tab--active' : '']"
              @click="imageTab = 'url'"
            >
              URL
            </button>
            <button 
              :class="['neu-image-tab', imageTab === 'upload' ? 'neu-image-tab--active' : '']"
              @click="imageTab = 'upload'"
            >
              Загрузить
            </button>
          </div>
          
          <div class="neu-editor-form">
            <!-- URL Tab -->
            <div v-if="imageTab === 'url'" class="neu-editor-form-group">
              <label class="neu-editor-label">URL изображения</label>
              <input v-model="imageUrl" type="url" class="neu-editor-input" placeholder="https://..." />
              <div v-if="imageUrl" class="neu-image-preview">
                <img :src="imageUrl" alt="Предпросмотр" class="neu-image-preview-img" />
              </div>
            </div>
            
            <!-- Upload Tab -->
            <div v-if="imageTab === 'upload'" class="neu-editor-form-group">
              <label class="neu-editor-label">Загрузить файл</label>
              <div class="neu-file-dropzone" @dragover.prevent @drop="handleDrop" @click="triggerFileInput">
                <input 
                  ref="fileInputRef"
                  type="file" 
                  @change="handleFileInputChange" 
                  accept="image/*" 
                  class="neu-editor-file-hidden"
                  :disabled="isUploading" 
                />
                <div class="neu-dropzone-content">
                  <span v-if="!isUploading" class="iconify neu-dropzone-icon" data-icon="lucide:cloud-upload"></span>
                  <span v-if="isUploading" class="iconify neu-dropzone-icon animate-spin" data-icon="lucide:loader"></span>
                  <span>{{ uploadStatus || 'Перетащите файл сюда или кликните для выбора' }}</span>
                  <span class="neu-dropzone-hint">PNG, JPG, GIF до 5MB</span>
                </div>
              </div>
              <div v-if="uploadedImagePreview" class="neu-image-preview">
                <img :src="uploadedImagePreview" alt="Загружено" class="neu-image-preview-img" />
                <div class="neu-image-preview-info">
                  <span class="neu-image-preview-name">✓ Изображение загружено</span>
                </div>
              </div>
            </div>
            
            <!-- Image Options -->
            <div class="neu-image-options">
              <h4 class="neu-image-options-title">Параметры</h4>
              
              <div class="neu-editor-form-row">
                <div class="neu-editor-form-group">
                  <label class="neu-editor-label">Выравнивание</label>
                  <select v-model="imageOptions.align" class="neu-editor-input">
                    <option value="">По умолчанию</option>
                    <option value="left">Слева</option>
                    <option value="center">По центру</option>
                    <option value="right">Справа</option>
                  </select>
                </div>
                
                <div class="neu-editor-form-group">
                  <label class="neu-editor-label">Размер</label>
                  <select v-model="imageOptions.size" class="neu-editor-input">
                    <option value="">Оригинальный</option>
                    <option value="small">Маленькое (200px)</option>
                    <option value="medium">Среднее (400px)</option>
                    <option value="large">Большое (600px)</option>
                    <option value="full">На всю ширину</option>
                  </select>
                </div>
              </div>
              
              <div class="neu-editor-form-group">
                <label class="neu-editor-label">Подпись</label>
                <input v-model="imageOptions.caption" type="text" class="neu-editor-input" placeholder="Подпись к изображению" />
              </div>
              
              <div class="neu-image-styles">
                <label class="neu-editor-label">Стили</label>
                <div class="neu-image-style-options">
                  <label class="neu-image-style-option">
                    <input type="checkbox" v-model="imageOptions.rounded" />
                    <span>Скруглённые углы</span>
                  </label>
                  <label class="neu-image-style-option">
                    <input type="checkbox" v-model="imageOptions.border" />
                    <span>Рамка</span>
                  </label>
                  <label class="neu-image-style-option">
                    <input type="checkbox" v-model="imageOptions.shadow" />
                    <span>Тень</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="neu-editor-form-actions">
              <button type="button" class="neu-btn neu-btn--primary" @click="insertImageWithOptions">Вставить</button>
              <button type="button" class="neu-btn neu-btn--default" @click="showImageModal = false">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useAuthorsStore } from '@/stores/authors'
import { useIssuesStore } from '@/stores/issues'
import { uploadImage } from '@/services/imageUpload'
import CoverPreview from '@/components/ui/CoverPreview.vue'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const authorsStore = useAuthorsStore()
const issuesStore = useIssuesStore()

// Определяем тип страницы и режим (создание или редактирование)
const isArticle = computed(() => route.name === 'cms-article-edit' || route.name === 'cms-article-new')
const isAuthor = computed(() => route.name === 'cms-author-edit' || route.name === 'cms-author-new')
const isIssue = computed(() => route.name === 'cms-issue-edit' || route.name === 'cms-issue-new')
const isNewMode = computed(() => route.name.includes('-new'))
const backUrl = computed(() => {
  if (isArticle.value) return '/cms/articles'
  if (isAuthor.value) return '/cms/authors'
  return '/cms/issues'
})
const pageTitle = computed(() => {
  const mode = isNewMode.value ? 'Создание' : 'Редактирование'
  if (isArticle.value) return `${mode} статьи`
  if (isAuthor.value) return `${mode} автора`
  return `${mode} номера`
})

const articles = computed(() => articlesStore.allArticles)
const authors = computed(() => authorsStore.allAuthors)
const issues = computed(() => issuesStore.allIssues)

const genres = [
  'Роман', 'Рассказ', 'Повесть', 'Стихотворения', 'Поэма',
  'Эссе', 'Статья', 'Интервью', 'Рецензия', 'Исторический экскурс',
  'Редакционное слово', 'Репортаж', 'Очерк', 'Критика'
]

const form = ref({
  title: '',
  subtitle: '',
  body: '',
  authorId: '',
  issueId: '',
  section: 'prose',
  rubric: '',
  genre: '',
  customGenre: '',
  // For authors
  name: '',
  tagline: '',
  bio: '',
  photoUrl: '',
  // For issues
  num: '',
  serial: '',
  year: '',
  month: 'март',
  theme: '',
  editor: '',
  description: '',
  coverImageUrl: '',
  coverVideoUrl: '',
  team: []
})

const wordCount = ref(0)
const charCount = ref(0)
const pageCount = ref(0)

const showImageModal = ref(false)
const imageUrl = ref('')
const imageTab = ref('url')
const uploadedImagePreview = ref('')
const fileInputRef = ref(null)
const isUploading = ref(false)
const uploadStatus = ref('')
const imageOptions = ref({
  align: '',
  size: '',
  caption: '',
  rounded: false,
  border: false,
  shadow: false
})

// Для загрузки обложки
const uploadingCover = ref(false)
const coverUploadError = ref('')

onMounted(async () => {
  const id = route.params.id

  // Сначала загружаем справочники
  if (issuesStore.issues.length === 0) {
    await issuesStore.fetchIssues()
  }
  if (authorsStore.authors.length === 0) {
    await authorsStore.fetchAuthors()
  }

  // Для новых номеров - устанавливаем текущий год и вычисляем сквозной номер
  if (isNewMode.value && isIssue.value) {
    const currentYear = new Date().getFullYear()
    form.value.year = currentYear
    
    // Вычисляем следующий сквозной номер (макс. существующий + 1)
    if (issuesStore.issues.length > 0) {
      const maxSerial = Math.max(...issuesStore.issues.map(i => i.serial || 0), 0)
      form.value.serial = maxSerial + 1
      
      // Вычисляем номер за год (макс. за текущий год + 1)
      const issuesThisYear = issuesStore.issues.filter(i => i.year === currentYear)
      if (issuesThisYear.length > 0) {
        const maxNum = Math.max(...issuesThisYear.map(i => i.num || 0), 0)
        form.value.num = maxNum + 1
      } else {
        form.value.num = 1
      }
      
      // Загружаем команду из последнего номера
      const lastIssue = issuesStore.issues[0]
      if (lastIssue && lastIssue.team) {
        form.value.team = [...lastIssue.team]
      }
    } else {
      form.value.serial = 109 // Последний номер на старом сайте: №4 (108) март 2026
      form.value.num = 5 // Продолжаем с 5 (после №4 на старом сайте)
      // Первая команда по умолчанию
      form.value.team = [
        { name: '', role: '' }
      ]
    }
  }

  // Загружаем данные из базы если store пуст
  if (isArticle.value) {
    // Проверяем, есть ли статьи в store
    if (articlesStore.articles.length === 0) {
      await articlesStore.fetchArticles()
    }
    const article = articlesStore.getArticleById(id)
    if (article) {
      form.value = { ...article }
      updateStats(article.body)
    } else {
      // Пробуем загрузить конкретную статью
      try {
        const loaded = await articlesStore.fetchArticleById(id)
        if (loaded) {
          form.value = { ...loaded }
          updateStats(loaded.body)
        }
      } catch (e) {
        console.error('Failed to load article:', e)
      }
    }
  } else if (isAuthor.value) {
    // Для авторов
    if (authorsStore.authors.length === 0) {
      await authorsStore.fetchAuthors()
    }
    const author = authorsStore.getAuthorById(id)
    if (author) {
      form.value = { ...author }
    } else {
      try {
        const loaded = await authorsStore.fetchAuthorById(id)
        if (loaded) {
          form.value = { ...loaded }
        }
      } catch (e) {
        console.error('Failed to load author:', e)
      }
    }
  } else if (isIssue.value && !isNewMode.value) {
    // Для номеров (только редактирование)
    const issue = issuesStore.getIssueById(id)
    if (issue) {
      form.value = {
        ...issue,
        coverImageUrl: issue.coverImageUrl || '',
        team: issue.team || []
      }
    } else {
      try {
        const loaded = await issuesStore.fetchIssueById(id)
        if (loaded) {
          form.value = {
            ...loaded,
            coverImageUrl: loaded.coverImageUrl || '',
            team: loaded.team || []
          }
        }
      } catch (e) {
        console.error('Failed to load issue:', e)
      }
    }
  }
})

// Функция updateSerial больше не нужна - сквозной номер устанавливается автоматически

function updateStats(content) {
  const text = content.replace(/<[^>]*>/g, '').trim()
  wordCount.value = text.split(/\s+/).filter(Boolean).length
  charCount.value = text.length
  pageCount.value = Math.max(1, Math.ceil(wordCount.value / 220))
}

function updateContent(e) {
  form.value.body = e.target.innerHTML
  updateStats(form.value.body)
}

function execCmd(command, value = null) {
  document.execCommand(command, false, value)
}

function insertImage() {
  imageUrl.value = ''
  showImageModal.value = true
}

function insertLink() {
  const url = prompt('Введите URL ссылки:')
  if (url) {
    execCmd('createLink', url)
  }
}

function unlink() {
  execCmd('unlink')
}

// Image manipulation functions
function getSelectedImage() {
  const selection = window.getSelection()
  if (!selection.rangeCount) return null
  
  const range = selection.getRangeAt(0)
  let node = range.commonAncestorContainer
  
  // Find image in selection
  while (node && node.nodeName !== 'IMG') {
    node = node.parentNode
  }
  
  return node
}

function imageAlign(alignment) {
  const img = getSelectedImage()
  if (!img) {
    alert('Сначала выберите изображение')
    return
  }
  
  img.style.display = 'block'
  img.style.margin = '0'
  
  switch(alignment) {
    case 'left':
      img.style.float = 'left'
      img.style.marginRight = '1em'
      img.style.marginBottom = '1em'
      break
    case 'center':
      img.style.float = 'none'
      img.style.marginLeft = 'auto'
      img.style.marginRight = 'auto'
      break
    case 'right':
      img.style.float = 'right'
      img.style.marginLeft = '1em'
      img.style.marginBottom = '1em'
      break
  }
}

function imageSize(size) {
  const img = getSelectedImage()
  if (!img) {
    alert('Сначала выберите изображение')
    return
  }
  
  const sizes = {
    small: '200px',
    medium: '400px',
    large: '600px',
    full: '100%'
  }
  
  img.style.width = sizes[size]
  img.style.height = 'auto'
}

function imageStyle(style) {
  const img = getSelectedImage()
  if (!img) {
    alert('Сначала выберите изображение')
    return
  }
  
  switch(style) {
    case 'rounded':
      img.style.borderRadius = img.style.borderRadius ? '0' : '8px'
      break
    case 'border':
      img.style.border = img.style.border && img.style.border !== 'none' ? 'none' : '2px solid var(--neu-primary)'
      break
    case 'shadow':
      img.style.boxShadow = img.style.boxShadow ? 'none' : '4px 4px 8px rgba(0,0,0,0.2)'
      break
  }
}

function imageCaption() {
  const img = getSelectedImage()
  if (!img) {
    alert('Сначала выберите изображение')
    return
  }
  
  const caption = prompt('Введите подпись к изображению:')
  if (caption) {
    const figcaption = document.createElement('figcaption')
    figcaption.textContent = caption
    figcaption.style.cssText = 'text-align: center; font-style: italic; color: var(--neu-text-secondary); font-size: 0.85rem; margin-top: 0.5rem;'
    
    // Wrap in figure if not already
    if (img.parentNode.nodeName !== 'FIGURE') {
      const figure = document.createElement('figure')
      figure.style.cssText = 'margin: 1em 0;'
      img.parentNode.insertBefore(figure, img)
      figure.appendChild(img)
    }
    
    // Remove existing caption
    const existingCaption = img.parentNode.querySelector('figcaption')
    if (existingCaption) {
      existingCaption.remove()
    }
    
    img.parentNode.appendChild(figcaption)
  }
}

function insertHorizontalRule() {
  execCmd('insertHorizontalRule')
}

function insertTable() {
  const rows = prompt('Количество строк:', '3')
  const cols = prompt('Количество столбцов:', '2')
  if (rows && cols) {
    let html = '<table style="width:100%; border-collapse: collapse;">'
    for (let i = 0; i < rows; i++) {
      html += '<tr>'
      for (let j = 0; j < cols; j++) {
        html += '<td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>'
      }
      html += '</tr>'
    }
    html += '</table>'
    document.execCommand('insertHTML', false, html)
  }
}

function insertSpecialChar() {
  const chars = ['©', '®', '™', '€', '£', '¥', '°', '±', '×', '÷', '…', '—', '–', '•', '★', '✓', '✗', '→', '←', '↑', '↓']
  const char = prompt('Введите спецсимвол или выберите из списка:\n' + chars.join(' '))
  if (char) {
    execCmd('insertText', char)
  }
}

function removeFormat() {
  execCmd('removeFormat')
}

function printContent() {
  const content = document.querySelector('.neu-editor-content').innerHTML
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Печать</title>
      <style>
        body { font-family: 'PT Serif', Georgia, serif; padding: 40px; }
        p { text-indent: 1.6em; margin-bottom: 1em; }
        p:first-of-type { text-indent: 0; }
        h1, h2, h3 { color: #7A1515; }
        blockquote { border-left: 3px solid #7A1515; padding-left: 1em; font-style: italic; }
        img { max-width: 100%; }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

function insertImageUrl() {
  if (imageUrl.value) {
    execCmd('insertImage', imageUrl.value)
    showImageModal.value = false
  }
}

function insertImageWithOptions() {
  if (!imageUrl.value) {
    alert('Введите URL или загрузите изображение')
    return
  }
  
  let html = `<img src="${imageUrl.value}" alt=""`
  
  // Size
  const sizes = {
    small: '200px',
    medium: '400px',
    large: '600px',
    full: '100%'
  }
  
  let styleParts = []
  
  if (imageOptions.value.size && sizes[imageOptions.value.size]) {
    styleParts.push(`width: ${sizes[imageOptions.value.size]}`)
    styleParts.push('height: auto')
  }
  
  // Alignment
  if (imageOptions.value.align === 'left') {
    styleParts.push('float: left')
    styleParts.push('margin-right: 1em')
    styleParts.push('margin-bottom: 1em')
  } else if (imageOptions.value.align === 'right') {
    styleParts.push('float: right')
    styleParts.push('margin-left: 1em')
    styleParts.push('margin-bottom: 1em')
  } else if (imageOptions.value.align === 'center') {
    styleParts.push('display: block')
    styleParts.push('margin-left: auto')
    styleParts.push('margin-right: auto')
  }
  
  // Styles
  if (imageOptions.value.rounded) {
    styleParts.push('border-radius: 8px')
  }
  if (imageOptions.value.border) {
    styleParts.push('border: 2px solid var(--neu-primary)')
  }
  if (imageOptions.value.shadow) {
    styleParts.push('box-shadow: 4px 4px 8px rgba(0,0,0,0.2)')
  }
  
  if (styleParts.length > 0) {
    html += ` style="${styleParts.join('; ')}"`
  }
  
  html += ' />'
  
  // Add caption if provided
  if (imageOptions.value.caption) {
    html = `<figure style="margin: 1em 0; text-align: ${imageOptions.value.align === 'center' ? 'center' : 'left'};">${html}<figcaption style="text-align: center; font-style: italic; color: var(--neu-text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">${imageOptions.value.caption}</figcaption></figure>`
  }
  
  // Insert at cursor position
  const editor = document.querySelector('.neu-editor-content')
  if (editor) {
    editor.focus()
    
    // Try execCommand first
    const success = document.execCommand('insertHTML', false, html)
    
    // Fallback: insert at end if execCommand fails
    if (!success) {
      const range = document.createRange()
      const sel = window.getSelection()
      const lastChild = editor.lastChild
      
      if (lastChild) {
        range.setStartAfter(lastChild)
      } else {
        range.selectNodeContents(editor)
        range.collapse(false)
      }
      
      sel.removeAllRanges()
      sel.addRange(range)
      
      const div = document.createElement('div')
      div.innerHTML = html
      while (div.firstChild) {
        editor.appendChild(div.firstChild)
      }
    }
  }
  
  // Reset options
  imageUrl.value = ''
  uploadedImagePreview.value = ''
  imageTab.value = 'url'
  imageOptions.value = {
    align: '',
    size: '',
    caption: '',
    rounded: false,
    border: false,
    shadow: false
  }
  showImageModal.value = false
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

async function handleFileInputChange(e) {
  const file = e.target.files[0]
  if (file) {
    try {
      isUploading.value = true
      uploadStatus.value = 'Загрузка...'
      
      // Загрузка на сервер
      const result = await uploadImage(file)
      
      uploadedImagePreview.value = result.url
      imageUrl.value = result.url
      uploadStatus.value = 'Готово'
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      uploadStatus.value = `Ошибка: ${error.message}`
      uploadedImagePreview.value = ''
      imageUrl.value = ''
    } finally {
      isUploading.value = false
    }
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    try {
      isUploading.value = true
      uploadStatus.value = 'Загрузка...'
      
      const result = await uploadImage(file)
      
      uploadedImagePreview.value = result.url
      imageUrl.value = result.url
      imageTab.value = 'upload'
      uploadStatus.value = 'Готово'
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      uploadStatus.value = `Ошибка: ${error.message}`
    } finally {
      isUploading.value = false
    }
  }
}

async function handleDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    try {
      isUploading.value = true
      uploadStatus.value = 'Загрузка...'
      
      const result = await uploadImage(file)
      
      uploadedImagePreview.value = result.url
      imageUrl.value = result.url
      imageTab.value = 'upload'
      uploadStatus.value = 'Готово'
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      uploadStatus.value = `Ошибка: ${error.message}`
    } finally {
      isUploading.value = false
    }
  }
}

function preview() {
  // TODO: Open preview modal
  alert('Предпросмотр будет реализован')
}

function save() {
  if (isArticle.value) {
    if (isNewMode.value) {
      // Создание новой статьи
      articlesStore.addArticle({
        ...form.value,
        sortOrder: articles.value.length + 1
      })
    } else {
      // Редактирование существующей
      articlesStore.updateArticle(route.params.id, form.value)
    }
  } else if (isAuthor.value) {
    if (isNewMode.value) {
      // Создание нового автора
      authorsStore.addAuthor(form.value)
    } else {
      // Редактирование существующего
      authorsStore.updateAuthor(route.params.id, form.value)
    }
  } else if (isIssue.value) {
    if (isNewMode.value) {
      // Создание нового номера
      issuesStore.addIssue({
        ...form.value,
        team: form.value.team || []
      })
    } else {
      // Редактирование существующего
      issuesStore.updateIssue(route.params.id, {
        ...form.value,
        team: form.value.team || []
      })
    }
  }
  router.push(backUrl.value)
}

function addTeamMember() {
  console.log('Adding team member, current team:', form.value.team)
  if (!form.value.team) {
    form.value.team = []
  }
  form.value.team.push({ name: '', role: '' })
  console.log('After add, team:', form.value.team)
}

function removeTeamMember(index) {
  console.log('Removing team member at index:', index)
  form.value.team.splice(index, 1)
  console.log('After remove, team:', form.value.team)
}

async function handleVideoUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.startsWith('video/')) {
    coverUploadError.value = 'Пожалуйста, выберите видео файл'
    return
  }

  if (file.size > 50 * 1024 * 1024) {
    coverUploadError.value = 'Размер видео не должен превышать 50MB'
    return
  }

  try {
    uploadingCover.value = true
    coverUploadError.value = ''

    const result = await uploadImage(file, 'videos')
    form.value.coverVideoUrl = result.url
    form.value.coverImageUrl = '' // Очищаем изображение если есть видео
  } catch (error) {
    console.error('Ошибка загрузки видео:', error)
    coverUploadError.value = 'Ошибка загрузки: ' + error.message
  } finally {
    uploadingCover.value = false
  }
}

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    coverUploadError.value = 'Пожалуйста, выберите изображение'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    coverUploadError.value = 'Размер изображения не должен превышать 5MB'
    return
  }

  try {
    uploadingCover.value = true
    coverUploadError.value = ''

    const result = await uploadImage(file, 'images')
    form.value.coverImageUrl = result.url
    form.value.coverVideoUrl = '' // Очищаем видео если есть изображение
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error)
    coverUploadError.value = 'Ошибка загрузки: ' + error.message
  } finally {
    uploadingCover.value = false
  }
}
</script>

<style scoped>
.neu-editor-page {
  min-height: 100vh;
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-lg);
}

.neu-editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.1);
  margin-bottom: var(--space-lg);
}

.neu-editor-toolbar-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.neu-editor-back {
  font-family: var(--fnr);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--neu-text-secondary);
  text-decoration: none;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.neu-editor-back:hover {
  color: var(--neu-primary);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
}

.neu-editor-title {
  font-family: var(--fj);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--neu-primary);
}

.neu-editor-actions {
  display: flex;
  gap: var(--space-sm);
}

.neu-editor-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-lg);
}

.neu-editor-layout--full {
  grid-template-columns: 1fr;
}

.neu-editor-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.neu-editor-card {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.1),
    -6px -6px 12px rgba(255, 255, 255, 0.1);
}

.neu-editor-section-title {
  font-family: var(--fj);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-lg);
}

.neu-editor-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.neu-editor-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.neu-editor-form-group--small {
  max-width: 150px;
}

.neu-editor-form-group--small .neu-editor-input {
  max-width: 100%;
}

.neu-editor-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-primary);
  font-family: var(--fnr);
}

.neu-editor-input,
.neu-editor-textarea {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  border: none;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.08),
    inset -2px -2px 4px rgba(255, 255, 255, 0.08);
  color: var(--neu-text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.neu-editor-input:focus,
.neu-editor-textarea:focus {
  outline: none;
  box-shadow:
    inset 3px 3px 6px rgba(0, 0, 0, 0.12),
    inset -3px -3px 6px rgba(255, 255, 255, 0.12);
}

.neu-editor-input--readonly {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.05),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
  color: var(--neu-text-secondary);
  cursor: default;
}

.neu-editor-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Rich Text Editor */
.neu-editor-toolbar-rich {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  border: 1px solid var(--neu-shadow-dark);
}

.neu-editor-toolbar-group {
  display: flex;
  gap: var(--space-xs);
  padding-right: var(--space-sm);
  border-right: 1px solid var(--neu-shadow-dark);
  align-items: center;
}

.neu-editor-toolbar-group:last-child {
  border-right: none;
}

.neu-editor-tool-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.1);
  color: var(--neu-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.neu-editor-tool-btn:hover {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
}

.neu-editor-tool-btn--primary {
  color: var(--neu-primary);
}

.neu-editor-tool-text {
  font-family: var(--fj);
  font-size: 0.75rem;
  font-weight: 700;
}

.neu-editor-tool-sub {
  font-size: 0.6rem;
  margin-left: 2px;
  opacity: 0.7;
}

/* Select Dropdowns */
.neu-editor-select {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.1);
  color: var(--neu-text-primary);
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  outline: none;
}

.neu-editor-select:hover {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
}

/* Color Pickers */
.neu-editor-color-picker {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
}

.neu-editor-color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.neu-editor-color-picker .iconify {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--neu-text-primary);
  pointer-events: none;
}

/* Status Bar */
.neu-editor-status-bar {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  margin-top: var(--space-md);
  font-size: 0.8rem;
  color: var(--neu-text-secondary);
  font-family: var(--fnr);
  border: 1px solid var(--neu-shadow-dark);
}

.neu-editor-status-item {
  white-space: nowrap;
}

.neu-editor-status-item--right {
  margin-left: auto;
  opacity: 0.7;
}

.neu-editor-content {
  min-height: 400px;
  padding: var(--space-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-md);
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.08),
    inset -2px -2px 4px rgba(255, 255, 255, 0.08);
  font-family: 'PT Serif', Georgia, serif;
  font-size: 16px;
  line-height: 1.8;
  color: var(--neu-text-primary);
  overflow-y: auto;
}

.neu-editor-content:focus {
  outline: none;
  box-shadow:
    inset 3px 3px 6px rgba(0, 0, 0, 0.12),
    inset -3px -3px 6px rgba(255, 255, 255, 0.12);
}

/* Sidebar */
.neu-editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.neu-editor-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-stat-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--neu-shadow-dark);
}

.neu-stat-label {
  color: var(--neu-text-secondary);
  font-size: 0.9rem;
}

.neu-stat-value {
  font-weight: 700;
  color: var(--neu-text-primary);
}

/* Image Upload */
.neu-editor-image-upload {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-sm);
}

.neu-editor-image-upload--cover {
  max-width: 400px;
  aspect-ratio: 3/4;
}

.neu-editor-video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md);
}

/* Cover Preview */
.neu-editor-card--cover-preview {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.neu-editor-card--cover-preview .neu-cover {
  max-width: 400px;
  margin: 0 auto;
}

/* Cover Upload */
.neu-cover-upload {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.05);
}

.neu-cover-upload__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  border-radius: var(--radius-md);
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.05),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.85rem;
  color: var(--neu-text-primary);
}

.neu-cover-upload__label:hover {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.05);
  color: var(--neu-primary);
}

.neu-cover-upload__icon {
  font-size: 1.5rem;
}

.neu-cover-upload__input {
  display: none;
}

.neu-cover-upload__status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  color: var(--neu-text-secondary);
  font-size: 0.85rem;
}

.neu-cover-upload__error {
  padding: var(--space-md);
  color: var(--neu-error);
  font-size: 0.85rem;
  background: linear-gradient(145deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
  border-radius: var(--radius-md);
}

.neu-editor-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neu-editor-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  color: var(--neu-text-muted);
}

.neu-editor-file {
  width: 100%;
  padding: var(--space-sm);
  background: transparent;
  color: var(--neu-text-primary);
  font-size: 0.85rem;
}

.neu-editor-form-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

/* Modal */
.neu-modal-body {
  padding: var(--space-xl);
}

.neu-modal-title {
  font-family: var(--fj);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-lg);
}

/* Image Upload Modal */
.neu-modal-box--lg {
  max-width: 700px;
}

.neu-image-upload-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  border-bottom: 2px solid var(--neu-shadow-dark);
}

.neu-image-tab {
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-family: var(--fnr);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neu-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.neu-image-tab:hover {
  color: var(--neu-primary);
}

.neu-image-tab--active {
  color: var(--neu-primary);
  border-bottom-color: var(--neu-primary);
}

.neu-image-preview {
  margin-top: var(--space-md);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
  padding: var(--space-md);
  text-align: center;
}

.neu-image-preview-img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.neu-file-dropzone {
  position: relative;
  border: 2px dashed var(--neu-shadow-dark);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  text-align: center;
  transition: all var(--transition-fast);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  cursor: pointer;
}

.neu-file-dropzone:hover {
  border-color: var(--neu-primary);
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.05);
}

.neu-editor-file-hidden {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.neu-dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--neu-text-secondary);
  pointer-events: none;
}

.neu-dropzone-icon {
  font-size: 3rem;
  color: var(--neu-primary);
}

.neu-dropzone-icon.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.neu-dropzone-hint {
  font-size: 0.75rem;
  opacity: 0.7;
}

.neu-image-preview {
  margin-top: var(--space-md);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
  padding: var(--space-md);
  text-align: center;
}

.neu-image-preview-img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.neu-image-preview-info {
  margin-top: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: linear-gradient(135deg, var(--neu-success), var(--neu-success-dark));
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
}

.neu-image-options {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--neu-shadow-dark);
}

.neu-image-options-title {
  font-family: var(--fj);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neu-primary);
  margin-bottom: var(--space-md);
}

.neu-editor-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.neu-editor-form-row--four {
  grid-template-columns: repeat(4, auto);
  gap: var(--space-md);
  align-items: end;
}

.neu-image-styles {
  margin-top: var(--space-md);
}

.neu-image-style-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.neu-image-style-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.9rem;
  color: var(--neu-text-primary);
  cursor: pointer;
}

.neu-image-style-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .neu-editor-layout {
    grid-template-columns: 1fr;
  }

  .neu-editor-sidebar {
    order: -1;
  }
}

/* Team List */
.neu-team-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.neu-team-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  border-radius: var(--radius-lg);
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.05),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
}

.neu-team-item-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  flex: 1;
}

.neu-team-item .neu-btn--danger {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(145deg, var(--neu-bg-secondary), var(--neu-bg-primary));
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.05),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
  color: var(--neu-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.neu-team-item .neu-btn--danger:hover {
  background: linear-gradient(145deg, var(--neu-bg-primary), var(--neu-bg-secondary));
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.05);
  color: var(--neu-error);
}

.neu-btn--add {
  width: auto;
  align-self: flex-start;
}
</style>
