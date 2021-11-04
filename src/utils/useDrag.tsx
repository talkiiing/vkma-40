import { Ref, useEffect } from 'react'
import { useMouse } from 'react-use'

interface UseDragMousePos {
  x: number
  y: number
}

interface UseDragProps {
  handleRef: Ref<HTMLDivElement>
  elementRef: Ref<HTMLDivElement>
}

const useDrag = (props: UseDragProps) => {

  //const {docX, docY, posX, posY, elX, elY} = useMouse(props.handleRef)

  useEffect(() => {

  }, [])

}

export default useDrag
