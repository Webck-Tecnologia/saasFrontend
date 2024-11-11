import { useEffect } from "react"
import { useSocketContext } from "@/context/SocketContext"
import useWorkspaceInstances from "@/zustand/workspaceInstances"

const useQRCodeListen = () => {
  const { socket } = useSocketContext()
  const { instances, setInstances } = useWorkspaceInstances()

  useEffect(() => {
    console.log("QRCodeListen")
    if (!socket) return
  }, [socket])
}
