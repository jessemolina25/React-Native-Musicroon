package shared

import (
	"time"
)

type MtvRoomTimerExpiredReason string

const (
	MtvRoomTimerExpiredReasonCanceled MtvRoomTimerExpiredReason = "canceled"
	MtvRoomTimerExpiredReasonFinished MtvRoomTimerExpiredReason = "finished"
)

type MtvRoomTimer struct {
	Duration  time.Duration
	Cancel    func()
	CreatedOn time.Time
}

const ControlTaskQueue = "CONTROL_TASK_QUEUE"

var (
	SignalChannelName = "control"
	MtvGetStateQuery  = "getState"
	NoRelatedUserID   = ""
)

type TrackMetadata struct {
	ID         string        `json:"id"`
	Title      string        `json:"title"`
	ArtistName string        `json:"artistName"`
	Duration   time.Duration `json:"duration"`
}

type TrackMetadataWithScore struct {
	TrackMetadata

	Score uint `json:"score"`
}

func (t TrackMetadataWithScore) WithMillisecondsDuration() TrackMetadataWithScoreWithDuration {
	return TrackMetadataWithScoreWithDuration{
		TrackMetadataWithScore: t,

		Duration: t.Duration.Milliseconds(),
	}
}

type TracksMetadataWithScoreSet struct {
	tracks []TrackMetadataWithScore
}

func (s *TracksMetadataWithScoreSet) Clear() {
	s.tracks = []TrackMetadataWithScore{}
}

func (s *TracksMetadataWithScoreSet) Len() int {
	return len(s.tracks)
}

func (s *TracksMetadataWithScoreSet) Has(trackID string) bool {
	for _, track := range s.tracks {
		if track.ID == trackID {
			return true
		}
	}

	return false
}

func (s *TracksMetadataWithScoreSet) Add(tracks ...TrackMetadataWithScore) {
	for _, track := range tracks {
		if isDuplicate := s.Has(track.ID); isDuplicate {
			continue
		}

		s.tracks = append(s.tracks, track)
	}
}

func (s *TracksMetadataWithScoreSet) Values() []TrackMetadataWithScore {
	return s.tracks[:]
}

// Shift removes the first element from the set and returns it as well as true.
// If the set was empty, it returns an empty TrackMetadataWithScore and false.
func (s *TracksMetadataWithScoreSet) Shift() (TrackMetadataWithScore, bool) {
	tracksCount := s.Len()
	if noElement := tracksCount == 0; noElement {
		return TrackMetadataWithScore{}, false
	}

	firstElement := s.tracks[0]

	if tracksCount == 1 {
		s.Clear()
	} else {
		s.tracks = s.tracks[1:]
	}

	return firstElement, true
}

type TrackMetadataWithScoreWithDuration struct {
	TrackMetadataWithScore

	Duration int64 `json:"duration"`
}

type CurrentTrack struct {
	TrackMetadataWithScore

	AlreadyElapsed time.Duration `json:"-"`
}

type ExposedCurrentTrack struct {
	CurrentTrack

	Duration int64 `json:"duration"`
	Elapsed  int64 `json:"elapsed"`
}

func (c CurrentTrack) Export(elapsed time.Duration) ExposedCurrentTrack {
	copy := c
	copy.AlreadyElapsed = 0
	return ExposedCurrentTrack{
		CurrentTrack: copy,
		Duration:     c.Duration.Milliseconds(),
		Elapsed:      elapsed.Milliseconds(),
	}
}

type InternalStateUser struct {
	UserID   string `json:"userID"`
	DeviceID string `json:"emittingDeviceID"`
}

type MtvRoomParameters struct {
	RoomID               string
	RoomCreatorUserID    string
	RoomName             string
	InitialUsers         map[string]*InternalStateUser
	InitialTracksIDsList []string
}

func (p MtvRoomParameters) Export() MtvRoomExposedState {
	return MtvRoomExposedState{
		RoomID:                 p.RoomID,
		Playing:                false,
		RoomCreatorUserID:      p.RoomCreatorUserID,
		RoomName:               p.RoomName,
		UserRelatedInformation: p.InitialUsers[p.RoomCreatorUserID],
	}
}

type MtvRoomExposedState struct {
	RoomID                 string                               `json:"roomID"`
	RoomCreatorUserID      string                               `json:"roomCreatorUserID"`
	Playing                bool                                 `json:"playing"`
	RoomName               string                               `json:"name"`
	UserRelatedInformation *InternalStateUser                   `json:"userRelatedInformation"`
	CurrentTrack           *ExposedCurrentTrack                 `json:"currentTrack"`
	Tracks                 []TrackMetadataWithScoreWithDuration `json:"tracks"`
	SuggestedTracks        []TrackMetadataWithScore             `json:"suggestedTracks"`
	UsersLength            int                                  `json:"usersLength"`
}

type SignalRoute string

const (
	SignalRoutePlay                     = "play"
	SignalRoutePause                    = "pause"
	SignalRouteJoin                     = "join"
	SignalRouteTerminate                = "terminate"
	SignalRouteGoToNextTrack            = "go-to-next-track"
	SignalRouteChangeUserEmittingDevice = "change-user-emitting-device"
	SignalRouteSuggestTracks            = "suggest-tracks"
)

type GenericRouteSignal struct {
	Route SignalRoute
}

type PlaySignal struct {
	Route SignalRoute
}

type NewPlaySignalArgs struct {
}

func NewPlaySignal(args NewPlaySignalArgs) PlaySignal {
	return PlaySignal{
		Route: SignalRoutePlay,
	}
}

type PauseSignal struct {
	Route SignalRoute
}

type NewPauseSignalArgs struct {
}

func NewPauseSignal(args NewPauseSignalArgs) PauseSignal {
	return PauseSignal{
		Route: SignalRoutePause,
	}
}

type JoinSignal struct {
	Route    SignalRoute
	UserID   string
	DeviceID string
}

type NewJoinSignalArgs struct {
	UserID   string
	DeviceID string
}

func NewJoinSignal(args NewJoinSignalArgs) JoinSignal {
	return JoinSignal{
		Route:    SignalRouteJoin,
		UserID:   args.UserID,
		DeviceID: args.DeviceID,
	}
}

type TerminateSignal struct {
	Route SignalRoute
}

type NewTerminateSignalArgs struct{}

func NewTerminateSignal(args NewTerminateSignalArgs) TerminateSignal {
	return TerminateSignal{
		Route: SignalRouteTerminate,
	}
}

type GoToNextTrackSignal struct {
	Route SignalRoute
}

func NewGoToNexTrackSignal() GoToNextTrackSignal {
	return GoToNextTrackSignal{
		Route: SignalRouteGoToNextTrack,
	}
}

type ChangeUserEmittingDeviceSignal struct {
	Route    SignalRoute
	UserID   string
	DeviceID string
}

type ChangeUserEmittingDeviceSignalArgs struct {
	UserID   string
	DeviceID string
}

func NewChangeUserEmittingDeviceSignal(args ChangeUserEmittingDeviceSignalArgs) ChangeUserEmittingDeviceSignal {
	return ChangeUserEmittingDeviceSignal{
		Route:    SignalRouteChangeUserEmittingDevice,
		UserID:   args.UserID,
		DeviceID: args.DeviceID,
	}
}

type SuggestTracksSignal struct {
	Route           SignalRoute
	TracksToSuggest []string
}

type SuggestTracksSignalArgs struct {
	TracksToSuggest []string
}

func NewSuggestTracksSignal(args SuggestTracksSignalArgs) SuggestTracksSignal {
	return SuggestTracksSignal{
		Route:           SignalRouteSuggestTracks,
		TracksToSuggest: args.TracksToSuggest,
	}
}
