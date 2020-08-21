<script>
import draggable from 'vuedraggable'
import render from '@/components/render/render'

function computeShowControl(controlItems) {
  if (!controlItems || !controlItems.length) {
    return true
  }

  let item

  for (let i = 0, len = controlItems.length; i < len; i++) {
    item = controlItems[i]

    if (item.controlItem) {
      if (item.valueEqual !== undefined && item.controlItem.__config__.defaultValue !== item.valueEqual) {
        return false
      }
    }
  }

  return true
}

const components = {
  itemBtns(h, currentItem, index, list) {
    const { copyItem, deleteItem, editHtmlItem, transformHtmlItem } = this.$listeners
    let btns = [
      <span
        class="drawing-item-operation operation-copy"
        title="复制"
        onClick={(event) => {
          copyItem(currentItem, list)
          event.stopPropagation()
        }}
      >
        <i class="el-icon-copy-document" />
      </span>,
      <span
        class="drawing-item-operation operation-delete"
        title="删除"
        onClick={(event) => {
          deleteItem(index, list)
          event.stopPropagation()
        }}
      >
        <i class="el-icon-delete" />
      </span>,
    ]

    if (this.currentItem.componentType === 'rich-html') {
      if (this.currentItem.htmlEditing) {
        btns.unshift([
          <span
            class="drawing-item-operation operation-trans-html"
            title="保存富文本"
            onClick={(event) => {
              transformHtmlItem(currentItem, list)
              event.stopPropagation()
            }}
          >
            <i class="el-icon-finished" />
          </span>,
        ])
      } else {
        btns.unshift(
          <span
            class="drawing-item-operation operation-edit-html"
            title="编辑富文本"
            onClick={(event) => {
              editHtmlItem(currentItem, list)
              event.stopPropagation()
            }}
          >
            <i class="el-icon-edit-outline" />
          </span>
        )
      }
    }

    return btns
  },
}
const layouts = {
  colFormItem(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    let className = this.activeId === config.formId ? 'drawing-item active-from-item' : 'drawing-item'
    if (this.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    let defaultRender = (
      <el-col
        span={config.span}
        class={className}
        nativeOnClick={(event) => {
          activeItem(currentItem)
          event.stopPropagation()
        }}
      >
        <el-form-item label-width={labelWidth} label={config.showLabel ? config.label : ''} required={config.required}>
          <render
            key={config.renderKey}
            conf={currentItem}
            onInput={(event) => {
              this.$set(config, 'defaultValue', event)
            }}
          >
            {child}
          </render>
        </el-form-item>
        {components.itemBtns.apply(this, arguments)}
      </el-col>
    )

    if (currentItem.componentType === 'rich-html') {
      if (!currentItem.htmlEditing) {
        return (
          <el-col span={config.span}>
            <el-row
              gutter={config.gutter}
              class={className}
              nativeOnClick={(event) => {
                activeItem(currentItem)
                event.stopPropagation()
              }}
            >
              <section domPropsInnerHTML={config.defaultValue} class="drawing-item-rich-text" />
              {components.itemBtns.apply(this, arguments)}
            </el-row>
          </el-col>
        )
      }

      return defaultRender
    }

    return defaultRender
  },
  rowFormItem(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    let className = this.activeId === config.formId ? 'drawing-row-item active-from-item' : 'drawing-row-item'
    let child = renderChildren.apply(this, arguments)

    if (currentItem.componentType === 'sub-form') {
      className = this.activeId === config.formId ? 'drawing-sub-form active-from-item' : 'drawing-sub-form'
      currentItem.show = computeShowControl(currentItem.__config__.controlItems)

      if (currentItem.show) {
        return (
          <el-col
            span={config.span}
            class={className}
            nativeOnClick={(event) => {
              activeItem(currentItem)
              event.stopPropagation()
            }}
          >
            <span class="component-name">{config.componentName}</span>
            <draggable list={config.children || []} animation={340} group="componentsGroup" class="drag-wrapper">
              {child}
            </draggable>
            {components.itemBtns.apply(this, arguments)}
          </el-col>
        )
      } else {
        return ''
      }
    }

    if (currentItem.type === 'flex') {
      child = (
        <el-row type={currentItem.type} justify={currentItem.justify} align={currentItem.align}>
          {child}
        </el-row>
      )
    }
    return (
      <el-col span={config.span}>
        <el-row
          gutter={config.gutter}
          class={className}
          nativeOnClick={(event) => {
            activeItem(currentItem)
            event.stopPropagation()
          }}
        >
          <span class="component-name">{config.componentName}</span>
          <draggable list={config.children || []} animation={340} group="componentsGroup" class="drag-wrapper">
            {child}
          </draggable>
          {components.itemBtns.apply(this, arguments)}
        </el-row>
      </el-col>
    )
  },
  raw(h, currentItem, index, list) {
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    return (
      <render
        key={config.renderKey}
        conf={currentItem}
        onInput={(event) => {
          this.$set(config, 'defaultValue', event)
        }}
      >
        {child}
      </render>
    )
  },
}

function renderChildren(h, currentItem, index, list) {
  const config = currentItem.__config__
  if (!Array.isArray(config.children)) return null
  return config.children.map((el, i) => {
    const layout = layouts[el.__config__.layout]
    if (layout) {
      return layout.call(this, h, el, i, config.children)
    }
    return layoutIsNotFound.call(this)
  })
}

function layoutIsNotFound() {
  throw new Error(`没有与${this.currentItem.__config__.layout}匹配的layout`)
}

export default {
  components: {
    render,
    draggable,
  },
  props: ['currentItem', 'index', 'drawingList', 'activeId', 'formConf'],

  render(h) {
    const layout = layouts[this.currentItem.__config__.layout]

    if (layout) {
      console.log('render', this.currentItem.__config__.label)
      return layout.call(this, h, this.currentItem, this.index, this.drawingList)
    }
    return layoutIsNotFound.call(this)
  },
}
</script>
