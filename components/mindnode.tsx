import { useEffect, useState } from "react"

interface Props {
  url: string
}
const MindNode = ({ url }: Props) => {
  const [width, setWidth] = useState(1000)
  const [height, setHeight] = useState(500)

  function updateWidth () {
    const { document: { body: { offsetWidth } } } = window
    if (offsetWidth > 1280) {
      setWidth(1240)
      setHeight(1240 / 2)
      
    } else if (offsetWidth > 1000) {
      setWidth(980)
      setHeight(980 / 2)

    } else if (offsetWidth > 770) {
      setWidth(750)
      setHeight(750 / 2)
    } else {
      setWidth(offsetWidth * 0.9)
      setHeight(offsetWidth * 0.5)
    }
  }
  
  
  useEffect(() => {
    console.log("xx")
    updateWidth()
    window.onresize = function() {
      updateWidth()
    }
  }, [])

  return (
    url ?
    <iframe id="embed_dom" name="embed_dom" width={width} height={height} src={url} />
    : null
  )
}

export default MindNode