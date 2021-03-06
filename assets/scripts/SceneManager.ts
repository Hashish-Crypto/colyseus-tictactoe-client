import { _decorator, Component, Node, Vec2, Label, Color, Input, input, EventMouse } from 'cc'
import Colyseus from 'db://colyseus-sdk/colyseus.js'
import { Board } from './board'

const { ccclass, property } = _decorator

@ccclass('SceneManager')
export class SceneManager extends Component {
  // Server connection settings
  @property
  private serverURL: string = 'localhost'

  @property
  private port: string = '2567'

  // UI Nodes
  @property({ type: Node })
  private menuNode: Node | null = null

  @property({ type: Node })
  private lobbyNode: Node | null = null

  @property({ type: Node })
  private gameNode: Node | null = null

  @property({ type: Node })
  private endgameNode: Node | null = null

  // Game Elements
  @property({ type: Board })
  private board: Board | null = null

  @property({ type: Label })
  private statusText: Label | null = null

  @property({ type: Label })
  private resultsText: Label | null = null

  @property({ type: Label })
  private timerText: Label | null = null

  // Local private variables
  private gameState: string = 'MENU'
  private client: Colyseus.Client | null = null
  private room: Colyseus.Room | null = null
  private countdownInterval: number

  onLoad() {
    const endpoint: string = `ws://${this.serverURL}:${this.port}`
    this.client = new Colyseus.Client(endpoint)
    this.resetGame()
  }

  resetGame() {
    this.gameState = 'MENU'
    this.board.initialize(this)
    this.handleGameState()
  }

  onEnable() {
    input.on(Input.EventType.MOUSE_DOWN, this.handleMouseClick, this)
  }

  onDisable() {
    input.off(Input.EventType.MOUSE_DOWN, this.handleMouseClick, this)
  }

  handleGameState() {
    this.menuNode.active = this.gameState === 'MENU'
    this.lobbyNode.active = this.gameState === 'LOBBY'
    this.gameNode.active = this.gameState === 'GAME'
    this.endgameNode.active = this.gameState === 'ENDGAME'
  }

  handleMouseClick(event: EventMouse) {
    switch (this.gameState) {
      case 'MENU': {
        this.gameState = 'LOBBY'
        this.handleGameState()
        this.connect()
        break
      }
    }
  }

  async connect() {
    console.log('Joining game...')
    this.room = await this.client.joinOrCreate('tictactoe')

    let numPlayers = 0
    this.room.state.players.onAdd = () => {
      numPlayers += 1

      if (numPlayers === 2) {
        this.onJoin()
      }
    }

    this.room.state.board.onChange = (value: number, index: number) => {
      const x = index % 3
      const y = Math.floor(index / 3)
      this.board.set(x, y, value)
    }

    this.room.state.listen('currentTurn', (sessionId: string) => {
      // go to next turn after a little delay, to ensure "onJoin" gets called before this.
      setTimeout(() => this.nextTurn(sessionId), 10)
    })

    this.room.state.listen('draw', () => this.showEndgame('Draw!'))
    this.room.state.listen('winner', (sessionId: string) =>
      this.showEndgame(this.room.sessionId === sessionId ? 'You win!' : 'You lose!')
    )

    this.room.state.onChange = (changes: any) => {
      console.log('state.onChange =>', changes)
    }

    this.room.onError.once(() => {
      this.showEndgame('And error has occurred, sorry!')
    })
  }

  showWinner(sessionId: string) {
    this.showEndgame(this.room.sessionId === sessionId ? 'You win!' : 'You lose!')
  }

  showEndgame(message: string) {
    this.room.leave()
    this.resultsText.string = message
    this.gameState = 'ENDGAME'
    this.handleGameState()
    clearInterval(this.countdownInterval)
    // Reset after a time
    setTimeout(() => {
      this.resetGame()
    }, 5000)
  }

  nextTurn(playerId: string) {
    if (playerId === this.room.sessionId) {
      this.statusText.string = 'Your move!'
    } else {
      this.statusText.string = "Opponent's turn..."
    }

    this.timerText.string = '10'
    this.timerText.color.set(Color.fromHEX(this.timerText.color, '#000000'))
  }

  onJoin() {
    console.log('Joined game!')
    this.gameState = 'GAME'
    this.handleGameState()
    this.countdownInterval = setInterval(this.turnCountdown.bind(this), 1000)
  }

  turnCountdown() {
    const currentNumber = parseInt(this.timerText.string, 10) - 1

    if (currentNumber >= 0) {
      this.timerText.string = currentNumber.toString()
    }

    const color = this.timerText.color
    if (currentNumber <= 3) {
      this.timerText.color.set(Color.fromHEX(color, '#934e60'))
    } else {
      this.timerText.color.set(Color.fromHEX(color, '#000000'))
    }
  }

  playerAction(pos: Vec2) {
    this.room.send('action', { x: pos.x, y: pos.y })
  }
}
