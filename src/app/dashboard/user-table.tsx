import { fetchCardsData } from "@/lib/helper";

export default async function UserCardsTable({
  currentPage,
  query,
  accessToken,
}: {
  currentPage: number;
  query: string;
  accessToken: string | undefined;
}) {
  const cardsData = await fetchCardsData(currentPage, query, accessToken);
  return (
    <>
      {cardsData?.map((card) => (
        <div
          key={card.id}
          className="min-w-screen-sm flex w-full items-center justify-between gap-4 border border-solid border-gray-400 p-3"
        >
          <p>{card.name}</p>
          <p>{card.anime}</p>
        </div>
      ))}
    </>
  );
}
