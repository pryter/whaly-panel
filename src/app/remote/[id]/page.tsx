"use client"
import {use, useEffect, useState} from "react";
import {Queue, Track} from "erela.js";
import React from "react";
import {play} from "@/src/actions/play";
import {useDisclosure} from "@heroui/use-disclosure";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/modal";
import { Button } from "@heroui/button";
import {PlayingCard, PlayingCardSkeleton, QueueCard} from "@/src/components/PlaylistCard";
import {Input} from "@heroui/input";
import { motion } from "framer-motion";
import {confirm} from "@/src/actions/confirm";
import {Spinner} from "@heroui/react";

const Page = ({
                params,
              }: {
  params: Promise<{ id: string }>
}) => {

  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const option = useDisclosure({id: "options"});
  const [sr, setSr] = useState<{options: Track[], sessionId: string}>()
  const [isSearch, setIsSearch] = useState(false)
  const [initialPos, setInitialPos] = useState<number>(0)
  const [countingPos, setCountingPos] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [counter, setCounter] = useState<any>()
  const { id } = use(params)

  const [status, setStatus] = useState("waiting")
  const [queue, setQueue] = useState<Queue>()
  const [current, setCurrent] = useState<Track>()
  const [query, setQuery] = useState<string>("")

  const connect = () => {
    try {
      // const ws = new WebSocket(`ws://localhost:3001?gid=${id}`);
      const ws = new WebSocket(`wss://whaly.pryter.me/ws?gid=${id}`);
      ws.onerror = () => {
        setStatus("error")
      }
      ws.onclose = () => {
        setStatus("closed")
      }

      ws.onmessage = (msg) => {
        setStatus("connected")
        const obj = JSON.parse(msg.data)
        console.log(obj)

        if (obj.state === "DESTROYING" || obj.disconnected) {
          setStatus("closed")
        }
        setQueue(obj.queue)
        setInitialPos(obj.position)
        setCurrent(obj.current)
        setIsPlaying(obj.isPlaying)
      }
    } catch (e) {
      setStatus("error")
    }
  }
  useEffect(() => {
    connect()
  }, []);

  useEffect(() => {
    if (status !== "connected") {
      onOpen()
    }else{
      onClose()
    }
  }, [status]);

  const submit = () => {
    if (!query) return
    setIsSearch(true)
    const cl = setTimeout(() => {
      setIsSearch(false)
    }, 5 * 1000)

    play(query, id).then((res) => {
      if (!res) return
      if (res.status === 200) {
        setSr(res.data)
        option.onOpen()
        setQuery("")
      }
      setIsSearch(false)
    })
    clearTimeout(cl)
  }

  const confirmSr = (trackId: string) => {
    if (!sr) return
    confirm(sr.sessionId, trackId).then((res) => {
      if (!res) return
      if (res.status === 200) {
        setSr(undefined)
        option.onClose()
      }
    })
  }

  useEffect(() => {
    clearInterval(counter)
    if (!isPlaying) return
    setCountingPos(initialPos)
    const i = setInterval(() => {
      setCountingPos(prev => prev + 1*1000)
    }, 1000)
    setCounter(i)
  }, [initialPos, isPlaying]);


  return <div className="p-6 min-h-screen flex items-center justify-center w-full bg-gradient-to-tr from-gray-700 via-gray-800 to-gray-900">
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} hideCloseButton={true}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Connection lost</ModalHeader>
            <ModalBody>
              <p>
                Your link may be broken or incorrect
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light">
                Close
              </Button>
              <Button onPress={connect} color="primary">
                Refresh
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    <Modal isOpen={option.isOpen} onOpenChange={option.onOpenChange} className="bg-white/80 backdrop-blur-[4px]">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold">Search Result</ModalHeader>
            <ModalBody>
              <p>
                Select one from the search result.
              </p>
              <div className="max-h-[500px] overflow-y-scroll flex flex-col space-y-2 p-2">
                {sr?.options?.map((item, index) => (
                  <motion.div key={`option-${index}`} onClick={() => {confirmSr(item.identifier)}} whileHover={{scale: 1.01}} className="shrink-0 cursor-pointer">
                    <QueueCard track={item}/>
                  </motion.div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={() => {option.onClose();setQuery("")}} color="danger" variant="light">
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    <div className="flex flex-col items-start space-y-2">
      <div className="">
        <h1 className="text-xl text-white font-black mb-2">Now Playing</h1>
        {current ? <PlayingCard track={current} pos={countingPos} gid={id} isPlaying={isPlaying} repeat={"none"}/> : <PlayingCardSkeleton/>}
        <div className="grow mt-4 flex flex-row items-center gap-2">
          <Input disabled={isSearch} value={query} onChange={(e) => {setQuery(e.target.value)}} classNames={{input: "text-lg px-2 text-white", inputWrapper: "h-[44px] opacity-70 backdrop-blur-xl"}} placeholder="Enter you query" type="text" />
          <Button disabled={isSearch} onPress={() => {submit()}} color="primary" className="font-semibold w-[100px] h-[44px]">
            {
              !isSearch ? <span>Submit</span> :
              <Spinner color="white" size={"sm"}/>
            }
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4 w-full px-2">
        <h1 className="text-white font-bold">Your Queue</h1>
        {queue && queue?.length > 0 ? queue?.map((item, index) => (
          <QueueCard key={`${index}-q`} track={item as Track}/>
        )) : <h1 className="text-white">Currently no queue</h1>}
      </div>
    </div>
  </div>
}

export default Page;