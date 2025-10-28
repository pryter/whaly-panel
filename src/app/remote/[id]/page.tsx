"use client"
import {use, useEffect, useState} from "react";
import {Queue, Track} from "erela.js";
import React from "react";
import {play} from "@/src/actions/play";
import {useDisclosure} from "@heroui/use-disclosure";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/modal";
import { Button } from "@heroui/button";
import {PlayingCard, QueueCard} from "@/src/components/PlaylistCard";
import {Input} from "@heroui/input";

const Page = ({
                params,
              }: {
  params: Promise<{ id: string }>
}) => {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const { id } = use(params)

  const [status, setStatus] = useState("waiting")
  const [queue, setQueue] = useState<Queue>()
  const [current, setCurrent] = useState<Track>()
  const [query, setQuery] = useState<string>("")

  useEffect(() => {
    try {
      const ws = new WebSocket(`ws://localhost:3001?gid=${id}`);
      ws.onerror = () => {
        setStatus("error")
      }
      ws.onmessage = (msg) => {
        setStatus("connected")
        const obj = JSON.parse(msg.data)
        setQueue(obj.queue)
        setCurrent(obj.current)
      }
    } catch (e) {
      setStatus("error")
    }
  }, []);

  useEffect(() => {
    if (status === "error") {
      onOpen()
    }
  }, [status]);

  const submit = () => {
    if (!query) return
    play(query, id).then((res) => {
      if (!res) return
      if (res.status === 200) {
        setQuery("")
      }
    })
  }


  return <div className="p-6 min-h-screen flex items-center justify-center w-full bg-gradient-to-tr from-gray-700 via-gray-800 to-gray-900">
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} hideCloseButton={true}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Connection lost</ModalHeader>
            <ModalBody>
              <p>
                Your linke may be broken or incorrect
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light">
                Close
              </Button>
              <Button color="primary">
                Refresh
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    <div className="flex flex-col items-start space-y-2">
      <div className="">
        <h1 className="text-xl text-white font-black mb-2">Now Playing</h1>
        {current && <PlayingCard track={current}/>}
        <div className="grow mt-4 flex flex-row items-center gap-2">
          <Input value={query} onChange={(e) => {setQuery(e.target.value)}} classNames={{input: "text-lg px-2 text-white", inputWrapper: "opacity-70 backdrop-blur-xl"}} placeholder="Enter you query" type="text" />
          <Button onPress={() => {submit()}} color="primary" className="font-semibold">Submit</Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <h1 className="text-white font-bold">Your Queue</h1>
        {queue?.map((item, index) => (
          <QueueCard key={`${index}-q`} track={item as Track}/>
        ))}
      </div>
    </div>
  </div>
}

export default Page;