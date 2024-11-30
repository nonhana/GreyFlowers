import type { CSSProperties } from 'vue'

const ZOOM_STEP = 0.2 // 每次滚轮缩放的步长
const ZOOM_MIN = 0.2 // 缩放最小值
const ZOOM_MAX = 10 // 缩放最大值

// 为 DOM 元素设置样式
function setStyles(el: HTMLElement, styles: CSSProperties) {
  Object.assign(el.style, styles)
}

// 计算两点之间的距离
function getDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch2.pageX - touch1.pageX
  const dy = touch2.pageY - touch1.pageY
  return Math.sqrt(dx * dx + dy * dy)
}

export default function useImgViewer(
  imgRef: Ref<HTMLImageElement | null>, // 图片 DOM
  props: {
    imgUrl: string
    maskBgColor: string
    animationDuration: number
  },
) {
  let initialDistance = 0 // 缩放时，初始两指距离

  let initialMouseX = 0 // 按下鼠标时，鼠标的初始位置 X
  let initialMouseY = 0 // 按下鼠标时，鼠标的初始位置 Y
  let initialBoxX = 0 // 初始大图的 transform X 偏移
  let initialBoxY = 0 // 初始大图的 transform Y 偏移

  const currentTranslateX = ref(0) // 当前大图的 transform X 偏移
  const currentTranslateY = ref(0) // 当前大图的 transform Y 偏移

  const zoomLevel = ref(1) // 缩放级别，初始为 1

  const newImgTransform = computed(
    () =>
      `translate(${
        currentTranslateX.value === 0 ? '-50%' : `${currentTranslateX.value}px`
      }, ${
        currentTranslateY.value === 0 ? '-50%' : `${currentTranslateY.value}px`
      }) scale(${zoomLevel.value})`,
  )

  const maskRef = ref<HTMLDivElement | null>(null) // 遮罩层 DOM
  const imgCopyRef = ref<HTMLImageElement | null>(null) // 大图 DOM

  const dragging = ref(false) // 是否正在拖动大图
  watch(dragging, (newV) => {
    if (imgCopyRef.value) {
      imgCopyRef.value.style.cursor = newV ? 'grabbing' : 'grab'
    }
  })

  // 滚轮缩放
  const handleWheel = (event: WheelEvent) => {
    if (imgCopyRef.value) {
      zoomLevel.value += event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      zoomLevel.value = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel.value))
      setStyles(imgCopyRef.value, {
        transform: newImgTransform.value,
      })
    }
  }

  // 双击大图时缩放
  const handleDblclick = () => {
    if (imgCopyRef.value) {
      zoomLevel.value = zoomLevel.value > 1 ? 1 : 2
      setStyles(imgCopyRef.value, {
        transform: newImgTransform.value,
      })
    }
  }

  // 双指触控缩放2 - 移动双指，缩放大图
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (imgCopyRef.value) {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const newDistance = getDistance(touch1, touch2)
        const scaleChange = newDistance / initialDistance
        zoomLevel.value = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, scaleChange))
        initialDistance = newDistance
      }
      else if (e.touches.length === 1) {
        const touch = e.touches[0]
        const deltaX = touch.pageX - initialMouseX
        const deltaY = touch.pageY - initialMouseY

        currentTranslateX.value = initialBoxX + deltaX
        currentTranslateY.value = initialBoxY + deltaY

        setStyles(imgCopyRef.value, {
          transform: newImgTransform.value,
        })
      }
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistance = 0
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }

  // 双指触控缩放1 - 记录初始两指距离
  const handleTouchStart = (e: TouchEvent) => {
    if (imgCopyRef.value) {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = getDistance(touch1, touch2)
      }
      else if (e.touches.length === 1) {
        const touch = e.touches[0]
        initialMouseX = touch.pageX
        initialMouseY = touch.pageY
        const transform = window.getComputedStyle(imgCopyRef.value).transform
        if (transform !== 'none') {
          const match = transform.match(/matrix\((.+)\)/)
          if (match) {
            const matrixValues = match[1].split(', ')
            initialBoxX = Number.parseFloat(matrixValues[4]) || 0
            initialBoxY = Number.parseFloat(matrixValues[5]) || 0
          }
        }
        else {
          initialBoxX = 0
          initialBoxY = 0
        }
      }

      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }
  }

  // 鼠标拖动大图
  const handleMouseMove = (e: MouseEvent) => {
    if (imgCopyRef.value) {
      const deltaX = e.clientX - initialMouseX
      const deltaY = e.clientY - initialMouseY

      currentTranslateX.value = initialBoxX + deltaX
      currentTranslateY.value = initialBoxY + deltaY

      setStyles(imgCopyRef.value, {
        transform: newImgTransform.value,
      })
    }
  }

  // 鼠标松开时移除事件监听
  const handleMouseUp = () => {
    dragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // 鼠标按下时初始化
  const handleMouseDown = (e: MouseEvent) => {
    if (imgCopyRef.value) {
      dragging.value = true

      e.preventDefault()

      initialMouseX = e.clientX
      initialMouseY = e.clientY

      const transform = window.getComputedStyle(imgCopyRef.value).transform
      if (transform !== 'none') {
        const match = transform.match(/matrix\((.+)\)/)
        if (match) {
          const matrixValues = match[1].split(', ')
          initialBoxX = Number.parseFloat(matrixValues[4]) || 0
          initialBoxY = Number.parseFloat(matrixValues[5]) || 0
        }
      }
      else {
        initialBoxX = 0
        initialBoxY = 0
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  // 生成遮罩层
  const generateMask = (cb: () => void): void => {
    const mask = document.createElement('div')
    setStyles(mask, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      zIndex: '999',
      transition: `all ${props.animationDuration / 1000}s`,
    })

    document.body.appendChild(mask)

    requestAnimationFrame(() => {
      mask.style.backgroundColor = props.maskBgColor
    })

    mask.onclick = cb
    maskRef.value = mask
  }

  // 生成新的大图
  const generateNewImg = (): void => {
    if (!imgRef.value)
      return

    const img = document.createElement('img')
    img.src = imgRef.value.src
    img.draggable = false

    const rect = imgRef.value.getBoundingClientRect()
    const imgAspectRatio = rect.width / rect.height
    const windowAspectRatio = window.innerWidth / window.innerHeight
    const scrollX = window.scrollX || document.documentElement.scrollLeft
    const scrollY = window.scrollY || document.documentElement.scrollTop

    setStyles(img, {
      position: 'absolute',
      width: imgAspectRatio > windowAspectRatio ? `${rect.width}px` : 'auto',
      height: imgAspectRatio > windowAspectRatio ? 'auto' : `${rect.height}px`,
      objectFit: 'cover',
      top: `${rect.top + scrollY}px`,
      left: `${rect.left + scrollX}px`,
      zIndex: '1000',
      transition: `all ${props.animationDuration / 1000}s`,
      cursor: 'grab',
    })

    document.body.appendChild(img)

    setTimeout(() => {
      setStyles(img, { transition: 'none' })
    }, props.animationDuration)

    requestAnimationFrame(() => {
      setStyles(img, {
        width: imgAspectRatio > windowAspectRatio ? '80vw' : 'auto',
        height: imgAspectRatio > windowAspectRatio ? 'auto' : '80vh',
        top: `calc(50vh + ${scrollY}px)`,
        left: '50%',
        transform: 'translate(-50%, -50%)',
      })
    })

    img.ondblclick = handleDblclick
    img.onmousedown = handleMouseDown

    imgCopyRef.value = img
  }

  // 清除所有生成的 DOM
  const clearDOM = () => {
    if (
      maskRef.value
      && imgCopyRef.value
      && imgRef.value
    ) {
      const rect = imgRef.value.getBoundingClientRect()
      const scrollX = window.scrollX || document.documentElement.scrollLeft
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const imgAspectRatio = rect.width / rect.height
      const windowAspectRatio = window.innerWidth / window.innerHeight

      maskRef.value.style.backgroundColor = 'rgba(0, 0, 0, 0)'

      setStyles(imgCopyRef.value, {
        transition: `all ${props.animationDuration / 1000}s`,
      })

      requestAnimationFrame(() => {
        setStyles(imgCopyRef.value!, {
          transform: 'none',
          width:
            imgAspectRatio > windowAspectRatio ? `${rect.width}px` : 'auto',
          height:
            imgAspectRatio > windowAspectRatio ? 'auto' : `${rect.height}px`,
          top: `${rect.top + scrollY}px`,
          left: `${rect.left + scrollX}px`,
        })
      })

      setTimeout(() => {
        maskRef.value?.remove()
        imgCopyRef.value?.remove()
        currentTranslateX.value = 0
        currentTranslateY.value = 0
        zoomLevel.value = 1
        maskRef.value = null
        imgCopyRef.value = null
      }, props.animationDuration)
    }
  }

  return {
    generateMask,
    generateNewImg,
    clearDOM,
    handleWheel,
    handleTouchStart,
  }
}