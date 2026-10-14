import { Box, Flex, Grid, Text } from '@devup-ui/react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { readLibrary } from '@/features/library/libraryStorage'
import type { SavedQuizSet } from '@/features/library/libraryStorage'

const fieldStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', font: 'inherit', minHeight: 44, padding: '10px 14px', width: '100%' }
const linkStyle = { color: 'var(--color-accent)', fontWeight: 800, textDecorationThickness: '2px', textUnderlineOffset: '4px' }

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

function Library() {
  const [library] = useState(readLibrary)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const location = useLocation()
  const notice = (location.state as { notice?: unknown } | null)?.notice
  const filtered = useMemo(() => {
    if (!library.ok) return []
    return library.value
      .filter((set) => set.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
      .sort((a, b) => sort === 'name' ? a.title.localeCompare(b.title, 'ko') : b.createdAt.localeCompare(a.createdAt))
  }, [library, search, sort])

  return (
    <Box as="section" maxW="1100px" mx="auto" px={["16px", "24px"]} py={["40px", "64px"]}>
      <Flex alignItems={["flex-start", "flex-end"]} flexDirection={["column", "row"]} gap="20px" justifyContent="space-between">
        <Box>
          <Text as="p" color="$accent" fontSize="13px" fontWeight={900} letterSpacing="0.08em" m={0}>MY LIBRARY · 자료 보관함</Text>
          <Text as="h1" color="$text" fontSize={["36px", "52px"]} letterSpacing="-0.055em" lineHeight={1.15} mb="12px" mt="12px">내 문제 모아보기</Text>
          <Text as="p" color="$muted" lineHeight={1.7} m={0}>이 브라우저에 저장한 문제 세트를 찾아 다시 풀거나 시험지로 내려받을 수 있어요.</Text>
        </Box>
        <Link style={{ ...linkStyle, alignItems: 'center', display: 'inline-flex', minHeight: 44 }} to="/upload">+ 새 자료 등록</Link>
      </Flex>

      {typeof notice === 'string' && <Text as="p" bg="$surfaceMuted" borderRadius="12px" color="$text" mt="28px" p="14px" role="status">{notice}</Text>}
      {!library.ok ? (
        <Box bg="$surface" borderColor="$danger" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="36px" p="26px" role="alert">
          <Text as="h2" color="$text" fontSize="22px" mt={0}>보관함을 열 수 없어요</Text>
          <Text as="p" color="$muted" lineHeight={1.7} mb={0}>{library.error}</Text>
        </Box>
      ) : library.value.length === 0 ? (
        <Box bg="$surface" borderColor="$border" borderRadius="20px" borderStyle="solid" borderWidth="1px" mt="36px" p={["26px", "40px"]}>
          <Text as="p" color="$accent" fontSize="14px" fontWeight={900} m={0}>아직 첫 세트가 없어요</Text>
          <Text as="h2" color="$text" fontSize="28px" letterSpacing="-0.04em" mb="10px" mt="12px">강의 자료 하나부터 시작해 볼까요?</Text>
          <Text as="p" color="$muted" lineHeight={1.7}>등록하면 5개의 예시 문제가 이 브라우저에 저장돼요.</Text>
          <Link style={linkStyle} to="/upload">자료 등록하기</Link>
        </Box>
      ) : (
        <>
          <Grid gap="12px" gridTemplateColumns={["1fr", "minmax(0, 1fr) 220px"]} mt="36px">
            <label>
              <Text as="span" color="$text" display="block" fontSize="14px" fontWeight={800} mb="7px">강의명 검색</Text>
              <input onChange={(event) => setSearch(event.target.value)} placeholder="찾고 싶은 강의명" style={fieldStyle} type="search" value={search} />
            </label>
            <label>
              <Text as="span" color="$text" display="block" fontSize="14px" fontWeight={800} mb="7px">정렬</Text>
              <select onChange={(event) => setSort(event.target.value as 'recent' | 'name')} style={fieldStyle} value={sort}>
                <option value="recent">최근 등록순</option><option value="name">이름순</option>
              </select>
            </label>
          </Grid>
          <Text as="p" color="$muted" fontSize="14px" mt="18px" role="status">{filtered.length}개 세트</Text>
          {filtered.length === 0 ? (
            <Box bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" mt="18px" p="26px">
              <Text as="h2" color="$text" fontSize="22px" mt={0}>검색 결과가 없어요</Text>
              <Text as="p" color="$muted" m={0}>다른 강의명으로 검색해 보세요.</Text>
            </Box>
          ) : (
            <Grid as="ul" gap="14px" gridTemplateColumns={["1fr", "repeat(2, minmax(0, 1fr))"]} listStyleType="none" m={0} mt="18px" p={0}>
              {filtered.map((set: SavedQuizSet) => (
                <Box as="li" bg="$surface" borderColor="$border" borderRadius="18px" borderStyle="solid" borderWidth="1px" key={set.id} minW={0} p="24px">
                  <Text as="p" color="$accent" fontSize="13px" fontWeight={900} m={0}>{set.materialType === 'video' ? '강의 영상' : '강의 교안'} · {formatDate(set.createdAt)}</Text>
                  <Text as="h2" color="$text" fontSize="22px" letterSpacing="-0.03em" lineHeight={1.4} mb="10px" mt="10px" overflowWrap="anywhere"><Link style={{ color: 'inherit' }} to={`/library/${set.id}`}>{set.title}</Link></Text>
                  <Text as="p" color="$muted" fontSize="14px" lineHeight={1.6} m={0} overflowWrap="anywhere">{set.fileName} · {set.questions.length}문제</Text>
                  <Flex flexWrap="wrap" gap="18px" mt="24px">
                    <Link style={linkStyle} to={`/quiz/${set.id}`}>문제 풀기</Link>
                    <Link style={linkStyle} to={`/library/${set.id}`}>관리하기</Link>
                  </Flex>
                </Box>
              ))}
            </Grid>
          )}
        </>
      )}
      <Text as="p" color="$muted" fontSize="13px" lineHeight={1.7} mt="36px">문제 세트는 현재 브라우저에만 저장됩니다. 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 불러올 수 없어요.</Text>
    </Box>
  )
}

export default Library
