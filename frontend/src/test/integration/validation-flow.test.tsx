import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTableDialog } from '@/components/tables/CreateTableDialog'
import { CreateColumnDialog } from '@/components/columns/CreateColumnDialog'
import { useTableStore } from '@/stores/tableStore'
import * as validation from '@/lib/validation'

vi.mock('@/stores/tableStore', () => ({
  useTableStore: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  createColumn: vi.fn(),
  fetchColumns: vi.fn(),
}))

describe('검증 실행 → 에러 수정 → 재검증 플로우', () => {
  const mockCreateTable = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTableStore).mockReturnValue({
      createTable: mockCreateTable,
      tables: [],
      selectedTable: null,
      isLoading: false,
      error: null,
      fetchTables: vi.fn(),
      updateTable: vi.fn(),
      deleteTable: vi.fn(),
      selectTable: vi.fn(),
    } as ReturnType<typeof useTableStore>)
  })

  it('잘못된 테이블명 입력 → 검증 실패 → 수정 → 검증 성공', async () => {
    const user = userEvent.setup()

    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // 1. 소문자 테이블명 입력 (잘못된 형식)
    const nameInput = screen.getByLabelText(/테이블명/)
    await user.type(nameInput, 'user')

    // 2. 디바운스 후 검증 실패 메시지 확인
    await waitFor(() => {
      const badges = screen.queryAllByTestId('validation-badge')
      expect(badges.length).toBeGreaterThan(0)
    }, { timeout: 1000 })

    // 3. 올바른 형식으로 수정
    await user.clear(nameInput)
    await user.type(nameInput, 'USER')

    // 4. 디바운스 후 검증 성공 확인
    await waitFor(() => {
      const result = validation.validateTableName('USER')
      expect(result.isValid).toBe(true)
    }, { timeout: 1000 })
  })

  it('Description 검증 플로우', async () => {
    const user = userEvent.setup()

    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/테이블명/)
    const descInput = screen.getByLabelText(/Description/)

    // 1. 테이블명 입력
    await user.type(nameInput, 'USER')

    // 2. 테이블명을 그대로 복사 (잘못된 형식)
    await user.type(descInput, 'USER')

    // 3. 디바운스 후 검증 실패 확인
    await waitFor(() => {
      const result = validation.validateTableDescription('USER', 'USER')
      expect(result.isValid).toBe(false)
    }, { timeout: 1000 })

    // 4. 올바른 한글 설명으로 수정
    await user.clear(descInput)
    await user.type(descInput, '사용자 정보')

    // 5. 디바운스 후 검증 성공 확인
    await waitFor(() => {
      const result = validation.validateTableDescription('사용자 정보', 'USER')
      expect(result.isValid).toBe(true)
    }, { timeout: 1000 })
  })

  it('검증 실패 시 제출 버튼 비활성화', async () => {
    const user = userEvent.setup()

    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/테이블명/)
    const descInput = screen.getByLabelText(/Description/)

    // 잘못된 형식 입력
    await user.type(nameInput, 'user')
    await user.type(descInput, 'user')

    // 디바운스 대기
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /생성$/ })
      // 검증 실패 시 버튼이 비활성화되어야 함
      expect(submitButton).toBeDisabled()
    }, { timeout: 1000 })
  })

  it('컬럼명 검증: 소문자 → 대문자 수정', async () => {
    const user = userEvent.setup()

    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        nextOrderIndex={0}
      />
    )

    // 1. 소문자 컬럼명 입력 (잘못된 형식)
    const nameInput = screen.getByLabelText(/컬럼명/)
    await user.type(nameInput, 'user_id')

    // 2. 디바운스 후 검증 실패 확인
    await waitFor(() => {
      const result = validation.validateColumnName('user_id')
      expect(result.isValid).toBe(false)
    }, { timeout: 1000 })

    // 3. 대문자로 수정
    await user.clear(nameInput)
    await user.type(nameInput, 'USER_ID')

    // 4. 검증 성공 확인
    await waitFor(() => {
      const result = validation.validateColumnName('USER_ID')
      expect(result.isValid).toBe(true)
    }, { timeout: 1000 })
  })

  it('PK 컬럼 검증: 단독명칭 → 테이블명 포함', async () => {
    const user = userEvent.setup()

    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        nextOrderIndex={0}
      />
    )

    const nameInput = screen.getByLabelText(/컬럼명/)
    const pkCheckbox = screen.getByRole('checkbox', { name: /기본키/ })

    // 1. PK 체크
    await user.click(pkCheckbox)

    // 2. 단독명칭 입력 (잘못된 형식)
    await user.type(nameInput, 'ID')

    // 3. 디바운스 후 검증 실패 확인
    await waitFor(() => {
      const result = validation.validatePrimaryKeyColumnName('ID', 'USER')
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('테이블명')
    }, { timeout: 1000 })

    // 4. 테이블명 포함으로 수정
    await user.clear(nameInput)
    await user.type(nameInput, 'USER_ID')

    // 5. 검증 성공 확인
    await waitFor(() => {
      const result = validation.validatePrimaryKeyColumnName('USER_ID', 'USER')
      expect(result.isValid).toBe(true)
    }, { timeout: 1000 })
  })

  it('VARCHAR 길이 검증: 미입력 → 입력', async () => {
    const user = userEvent.setup()

    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="USER"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        nextOrderIndex={0}
      />
    )

    const nameInput = screen.getByLabelText(/컬럼명/)
    const dataTypeSelect = screen.getByLabelText(/데이터 타입/)

    // 1. 컬럼명 입력
    await user.type(nameInput, 'USER_NAME')

    // 2. VARCHAR 선택
    await user.click(dataTypeSelect)
    const varcharOption = screen.getByRole('option', { name: /VARCHAR/ })
    await user.click(varcharOption)

    // 3. 길이 필드가 나타나는지 확인
    await waitFor(() => {
      expect(screen.getByLabelText(/길이/)).toBeInTheDocument()
    })

    // 4. 길이 미입력 시 제출 버튼 비활성화
    const submitButton = screen.getByRole('button', { name: /생성$/ })
    expect(submitButton).toBeDisabled()

    // 5. 길이 입력
    const lengthInput = screen.getByLabelText(/길이/)
    await user.type(lengthInput, '100')

    // 6. 제출 버튼 활성화 확인
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('DECIMAL 정밀도/스케일 검증', async () => {
    const user = userEvent.setup()

    render(
      <CreateColumnDialog
        tableId="table1"
        tableName="PRODUCT"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        nextOrderIndex={0}
      />
    )

    const nameInput = screen.getByLabelText(/컬럼명/)
    const dataTypeSelect = screen.getByLabelText(/데이터 타입/)

    // 1. 컬럼명 입력
    await user.type(nameInput, 'PRICE')

    // 2. DECIMAL 선택
    await user.click(dataTypeSelect)
    const decimalOption = screen.getByRole('option', { name: /DECIMAL/ })
    await user.click(decimalOption)

    // 3. 정밀도/스케일 필드 확인
    await waitFor(() => {
      expect(screen.getByLabelText(/정밀도/)).toBeInTheDocument()
      expect(screen.getByLabelText(/스케일/)).toBeInTheDocument()
    })

    // 4. 정밀도/스케일 입력
    const precisionInput = screen.getByLabelText(/정밀도/)
    const scaleInput = screen.getByLabelText(/스케일/)

    await user.type(precisionInput, '18')
    await user.type(scaleInput, '2')

    // 5. 검증 성공 확인
    const submitButton = screen.getByRole('button', { name: /생성$/ })
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('여러 검증 오류 동시 수정', async () => {
    const user = userEvent.setup()

    render(
      <CreateTableDialog
        projectId="proj1"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/테이블명/)
    const descInput = screen.getByLabelText(/Description/)

    // 1. 모두 잘못된 형식으로 입력
    await user.type(nameInput, 'user')
    await user.type(descInput, 'user')

    // 2. 디바운스 후 두 개의 검증 오류 확인
    await waitFor(() => {
      const badges = screen.queryAllByTestId('validation-badge')
      expect(badges.length).toBeGreaterThanOrEqual(2)
    }, { timeout: 1000 })

    // 3. 테이블명 수정
    await user.clear(nameInput)
    await user.type(nameInput, 'USER')

    // 4. Description 수정
    await user.clear(descInput)
    await user.type(descInput, '사용자 정보')

    // 5. 모든 검증 통과 확인
    await waitFor(() => {
      const nameResult = validation.validateTableName('USER')
      const descResult = validation.validateTableDescription('사용자 정보', 'USER')
      expect(nameResult.isValid).toBe(true)
      expect(descResult.isValid).toBe(true)
    }, { timeout: 1000 })

    // 6. 제출 버튼 활성화 확인
    const submitButton = screen.getByRole('button', { name: /생성$/ })
    expect(submitButton).not.toBeDisabled()
  })
})
