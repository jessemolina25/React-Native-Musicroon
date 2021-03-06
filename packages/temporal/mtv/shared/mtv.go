package shared_mtv

import (
	"errors"
	"sort"
	"time"

	"github.com/AdonisEnProvence/MusicRoom/shared"
)

type MtvRoomTimerExpiredReason string

const (
	MtvRoomTimerExpiredReasonCanceled  MtvRoomTimerExpiredReason = "canceled"
	MtvRoomTimerExpiredReasonFinished  MtvRoomTimerExpiredReason = "finished"
	CheckForVoteUpdateIntervalDuration time.Duration             = 2000 * time.Millisecond
)

var (
	TrueValue  bool = true
	FalseValue bool = false
)

type MtvRoomTimer struct {
	Duration  time.Duration
	Cancel    func()
	CreatedOn time.Time
}

const ControlTaskQueue = "CONTROL_TASK_QUEUE"

var (
	SignalChannelName            = "control"
	MtvGetStateQuery             = "getState"
	MtvGetUsersListQuery         = "getUsersList"
	MtvGetRoomConstraintsDetails = "getRoomConstraintsDetails"
	NoRelatedUserID              = ""
)

type TrackMetadataWithScore struct {
	shared.TrackMetadata

	Score int `json:"score"`
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

func (s *TracksMetadataWithScoreSet) Clone() TracksMetadataWithScoreSet {
	originalTracks := s.Values()
	copiedTracks := make([]TrackMetadataWithScore, len(originalTracks))

	copy(copiedTracks, originalTracks)

	return TracksMetadataWithScoreSet{
		tracks: copiedTracks,
	}
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

func (s *TracksMetadataWithScoreSet) IndexOf(trackID string) (int, bool) {
	for index, track := range s.tracks {
		if track.ID == trackID {
			return index, true
		}
	}

	return -1, false
}

func (s *TracksMetadataWithScoreSet) Get(trackID string) (*TrackMetadataWithScore, bool) {
	index, exists := s.IndexOf(trackID)

	if !exists {
		return nil, false
	}

	return &s.tracks[index], true
}

func (s *TracksMetadataWithScoreSet) IncrementTrackScoreAndSortTracks(trackID string) bool {
	track, exists := s.Get(trackID)

	if !exists {
		return false
	}

	track.Score++
	s.StableSortByHigherScore()

	return true
}

func (s *TracksMetadataWithScoreSet) GetByIndex(index int) *TrackMetadataWithScore {
	tracksLength := s.Len()

	if tracksLength <= index {
		return nil
	}

	return &s.Values()[index]
}

func (s *TracksMetadataWithScoreSet) FirstTrackIsReadyToBePlayed(minimumScoreToBePlayed int) bool {

	firstTrack := s.GetByIndex(0)

	if firstTrack == nil {
		return false
	}

	return firstTrack.Score >= minimumScoreToBePlayed
}

func (s *TracksMetadataWithScoreSet) StableSortByHigherScore() {
	sort.SliceStable(s.tracks, func(i, j int) bool { return s.tracks[i].Score > s.tracks[j].Score })
}

func (s *TracksMetadataWithScoreSet) Add(track TrackMetadataWithScore) bool {
	if isDuplicate := s.Has(track.ID); isDuplicate {
		return false
	}

	s.tracks = append(s.tracks, track)
	return true
}

func (s *TracksMetadataWithScoreSet) Delete(trackID string) bool {
	for index, track := range s.tracks {
		if isMatching := track.ID == trackID; isMatching {
			s.tracks = append(s.tracks[:index], s.tracks[index+1:]...)

			return true
		}
	}

	return false
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

func (s TracksMetadataWithScoreSet) DeepEqual(toCmpTracksList TracksMetadataWithScoreSet) bool {
	if len(s.tracks) != len(toCmpTracksList.tracks) {
		return false
	}

	for index, track := range s.tracks {
		if track != toCmpTracksList.tracks[index] {
			return false
		}
	}
	return true
}

type TrackMetadataWithScoreWithDuration struct {
	TrackMetadataWithScore

	Duration int64 `json:"duration"`
}

type CurrentTrack struct {
	TrackMetadataWithScore

	AlreadyElapsed time.Duration `json:"-"`
}

func (s CurrentTrack) DeepEqual(toCmpCurrentTrack CurrentTrack) bool {
	return s == toCmpCurrentTrack
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
	UserID                            string   `json:"userID"`
	DeviceID                          string   `json:"emittingDeviceID"`
	TracksVotedFor                    []string `json:"tracksVotedFor"`
	UserFitsPositionConstraint        *bool    `json:"userFitsPositionConstraint"`
	HasControlAndDelegationPermission bool     `json:"hasControlAndDelegationPermission"`
	UserHasBeenInvited                bool     `json:"userHasBeenInvited"`
}

type ExposedInternalStateUserListElement struct {
	UserID                            string `json:"userID"`
	HasControlAndDelegationPermission bool   `json:"hasControlAndDelegationPermission"`
	IsCreator                         bool   `json:"isCreator"`
	IsDelegationOwner                 bool   `json:"isDelegationOwner"`
}

func (s *InternalStateUser) HasVotedFor(trackID string) bool {
	for _, votedFortrackID := range s.TracksVotedFor {
		if votedFortrackID == trackID {
			return true
		}
	}
	return false
}

type MtvRoomCoords struct {
	Lat float32 `json:"lat" validate:"required"`
	Lng float32 `json:"lng" validate:"required"`
}

type MtvRoomPhysicalAndTimeConstraints struct {
	//Adonis will manage the position process, but to keep a kind of unity
	//We would like to store in the params the constraints event if they won't
	//be used ( for now ? )
	PhysicalConstraintPosition MtvRoomCoords `json:"physicalConstraintPosition" validate:"required"`
	PhysicalConstraintRadius   int           `json:"physicalConstraintRadius" validate:"required"`
	PhysicalConstraintStartsAt time.Time     `json:"physicalConstraintStartsAt" validate:"required"`
	PhysicalConstraintEndsAt   time.Time     `json:"physicalConstraintEndsAt" validate:"required"`
}

type MtvRoomPhysicalAndTimeConstraintsWithPlaceID struct {
	PhysicalConstraintPlaceID  string    `json:"physicalConstraintPlaceID" validate:"required"`
	PhysicalConstraintRadius   int       `json:"physicalConstraintRadius" validate:"required"`
	PhysicalConstraintStartsAt time.Time `json:"physicalConstraintStartsAt" validate:"required"`
	PhysicalConstraintEndsAt   time.Time `json:"physicalConstraintEndsAt" validate:"required"`
}

type MtvPlayingModes string

func (m MtvPlayingModes) IsValid() bool {
	for _, mode := range MtvPlayingModesAllValues {
		if mode == m {
			return true
		}
	}

	return false
}

const (
	MtvPlayingModeDirect    MtvPlayingModes = "DIRECT"
	MtvPlayingModeBroadcast MtvPlayingModes = "BROADCAST"
)

var MtvPlayingModesAllValues = [...]MtvPlayingModes{MtvPlayingModeDirect, MtvPlayingModeBroadcast}

type MtvRoomCreationOptions struct {
	RoomName               string `json:"name" validate:"required" mapstructure:"name"`
	MinimumScoreToBePlayed int    `json:"minimumScoreToBePlayed" validate:"min=0"`
	// Same as for PhysicalConstraintPosition IsOpen won't be useful
	// for temporal itself but for the adonis mtv room search engine
	IsOpen                        bool                               `json:"isOpen"`
	IsOpenOnlyInvitedUsersCanVote bool                               `json:"isOpenOnlyInvitedUsersCanVote"`
	HasPhysicalAndTimeConstraints bool                               `json:"hasPhysicalAndTimeConstraints"`
	PhysicalAndTimeConstraints    *MtvRoomPhysicalAndTimeConstraints `json:"physicalAndTimeConstraints,omitempty"`
	PlayingMode                   MtvPlayingModes                    `json:"playingMode" validate:"required,oneof=DIRECT BROADCAST"`
}

type MtvRoomCreationOptionsFromExportWithPlaceID struct {
	RoomName               string `json:"name" validate:"required" mapstructure:"name"`
	MinimumScoreToBePlayed int    `json:"minimumScoreToBePlayed" validate:"min=0"`
	// Same as for PhysicalConstraintPosition IsOpen won't be useful
	// for temporal itself but for the adonis mtv room search engine
	IsOpen                        bool                                          `json:"isOpen"`
	IsOpenOnlyInvitedUsersCanVote bool                                          `json:"isOpenOnlyInvitedUsersCanVote"`
	HasPhysicalAndTimeConstraints bool                                          `json:"hasPhysicalAndTimeConstraints"`
	PhysicalAndTimeConstraints    *MtvRoomPhysicalAndTimeConstraintsWithPlaceID `json:"physicalAndTimeConstraints,omitempty"`
	PlayingMode                   MtvPlayingModes                               `json:"playingMode" validate:"required,oneof=DIRECT BROADCAST"`
}

type MtvRoomParameters struct {
	MtvRoomCreationOptions

	RoomID                        string
	RoomCreatorUserID             string
	CreatorUserRelatedInformation *InternalStateUser
	InitialTracksIDsList          []string
}

//This method will return an error if it determines that params are corrupted
func (p MtvRoomParameters) CheckParamsValidity(now time.Time) error {
	//Checking for unknown given playindMode label
	if !p.PlayingMode.IsValid() {
		return errors.New("PlayingMode is invalid")
	}

	//Looking for OnlyInvitedUsersCan vote enabled in private room error
	onlyInvitedUserTrueButRoomIsNotPublic := p.IsOpenOnlyInvitedUsersCanVote && !p.IsOpen
	if onlyInvitedUserTrueButRoomIsNotPublic {
		return errors.New("IsOpenOnlyInvitedUsersCanVote true but IsOpen false")
	}

	//Parsing given timeConstraint
	if err := p.VerifyTimeConstraint(now); err != nil {
		return err
	}

	return nil
}

func (p MtvRoomParameters) VerifyTimeConstraint(now time.Time) error {
	roomIsNotConcernedByConstraints := !p.HasPhysicalAndTimeConstraints && p.PhysicalAndTimeConstraints == nil
	if roomIsNotConcernedByConstraints {
		return nil
	}

	PhysicalAndTimeConstraintsSetButBooleanFalse := !p.HasPhysicalAndTimeConstraints && p.PhysicalAndTimeConstraints != nil
	if PhysicalAndTimeConstraintsSetButBooleanFalse {
		return errors.New("PhysicalAndTimeConstraints set but HasPhysicalAndTimeConstraints false")
	}

	RoomHasConstraintButPhysicalAndTimeConstraintAreNil := p.HasPhysicalAndTimeConstraints && p.PhysicalAndTimeConstraints == nil
	if RoomHasConstraintButPhysicalAndTimeConstraintAreNil {
		return errors.New("PhysicalAndTimeConstraints nil but HasPhysicalAndTimeConstraints true")
	}

	start := p.PhysicalAndTimeConstraints.PhysicalConstraintStartsAt
	end := p.PhysicalAndTimeConstraints.PhysicalConstraintEndsAt

	startsAtIsAfterEndsAt := start.After(end)
	if startsAtIsAfterEndsAt {
		return errors.New("start is after end")
	}

	startsAtEqualEndsAt := start.Equal(end)
	if startsAtEqualEndsAt {
		return errors.New("start equal end")
	}

	endsAtIsBeforeNow := end.Before(now)
	if endsAtIsBeforeNow {
		return errors.New("end is before now")
	}

	endsAtEqualNow := end.Equal(now)
	if endsAtEqualNow {
		return errors.New("end equal now")
	}

	return nil
}

type MtvRoomConstraintsDetails struct {
	RoomID                     string        `json:"roomID" validate:"required"`
	PhysicalConstraintPosition MtvRoomCoords `json:"physicalConstraintPosition" validate:"required"`
	PhysicalConstraintRadius   int           `json:"physicalConstraintRadius" validate:"required"`
	//Dates are stored using time.Time.Format()
	PhysicalConstraintStartsAt string `json:"physicalConstraintStartsAt" validate:"required"`
	PhysicalConstraintEndsAt   string `json:"physicalConstraintEndsAt" validate:"required"`
}

type MtvRoomExposedState struct {
	RoomID                            string                               `json:"roomID"`
	RoomCreatorUserID                 string                               `json:"roomCreatorUserID"`
	Playing                           bool                                 `json:"playing"`
	RoomName                          string                               `json:"name"`
	UserRelatedInformation            *InternalStateUser                   `json:"userRelatedInformation"`
	CurrentTrack                      *ExposedCurrentTrack                 `json:"currentTrack"`
	Tracks                            []TrackMetadataWithScoreWithDuration `json:"tracks"`
	MinimumScoreToBePlayed            int                                  `json:"minimumScoreToBePlayed"`
	UsersLength                       int                                  `json:"usersLength"`
	RoomHasTimeAndPositionConstraints bool                                 `json:"hasTimeAndPositionConstraints"`
	IsOpen                            bool                                 `json:"isOpen"`
	IsOpenOnlyInvitedUsersCanVotes    bool                                 `json:"isOpenOnlyInvitedUsersCanVote"`
	TimeConstraintIsValid             *bool                                `json:"timeConstraintIsValid"`
	PlayingMode                       MtvPlayingModes                      `json:"playingMode"`
	DelegationOwnerUserID             *string                              `json:"delegationOwnerUserID"`
}

const (
	SignalRoutePlay                            shared.SignalRoute = "play"
	SignalRoutePause                           shared.SignalRoute = "pause"
	SignalRouteJoin                            shared.SignalRoute = "join"
	SignalRouteLeave                           shared.SignalRoute = "leave"
	SignalRouteTerminate                       shared.SignalRoute = "terminate"
	SignalRouteGoToNextTrack                   shared.SignalRoute = "go-to-next-track"
	SignalRouteChangeUserEmittingDevice        shared.SignalRoute = "change-user-emitting-device"
	SignalRouteSuggestTracks                   shared.SignalRoute = "suggest-tracks"
	SignalRouteVoteForTrack                    shared.SignalRoute = "vote-for-track"
	SignalUpdateUserFitsPositionConstraint     shared.SignalRoute = "update-user-fits-position-constraint"
	SignalUpdateDelegationOwner                shared.SignalRoute = "update-delegation-owner"
	SignalUpdateControlAndDelegationPermission shared.SignalRoute = "update-control-and-delegation-permision"
)

type PlaySignal struct {
	Route  shared.SignalRoute `validate:"required"`
	UserID string             `validate:"required,uuid"`
}

type NewPlaySignalArgs struct {
	UserID string `validate:"required,uuid"`
}

func NewPlaySignal(args NewPlaySignalArgs) PlaySignal {
	return PlaySignal{
		Route:  SignalRoutePlay,
		UserID: args.UserID,
	}
}

type PauseSignal struct {
	Route  shared.SignalRoute `validate:"required"`
	UserID string             `validate:"required,uuid"`
}

type NewPauseSignalArgs struct {
	UserID string `validate:"required,uuid"`
}

func NewPauseSignal(args NewPauseSignalArgs) PauseSignal {
	return PauseSignal{
		Route:  SignalRoutePause,
		UserID: args.UserID,
	}
}

type LeaveSignal struct {
	Route  shared.SignalRoute `validate:"required"`
	UserID string             `validate:"required,uuid"`
}

type NewLeaveSignalArgs struct {
	UserID string
}

func NewLeaveSignal(args NewLeaveSignalArgs) JoinSignal {
	return JoinSignal{
		Route:  SignalRouteLeave,
		UserID: args.UserID,
	}
}

type JoinSignal struct {
	Route              shared.SignalRoute `validate:"required"`
	UserID             string             `validate:"required,uuid"`
	DeviceID           string             `validate:"required,uuid"`
	UserHasBeenInvited bool
}

type NewJoinSignalArgs struct {
	UserID             string
	DeviceID           string
	UserHasBeenInvited bool
}

func NewJoinSignal(args NewJoinSignalArgs) JoinSignal {
	return JoinSignal{
		Route:              SignalRouteJoin,
		UserID:             args.UserID,
		DeviceID:           args.DeviceID,
		UserHasBeenInvited: args.UserHasBeenInvited,
	}
}

type TerminateSignal struct {
	Route shared.SignalRoute
}

type NewTerminateSignalArgs struct{}

func NewTerminateSignal(args NewTerminateSignalArgs) TerminateSignal {
	return TerminateSignal{
		Route: SignalRouteTerminate,
	}
}

type GoToNextTrackSignal struct {
	Route  shared.SignalRoute `validate:"required"`
	UserID string             `validate:"required,uuid"`
}

type NewGoToNextTrackSignalArgs struct {
	UserID string `validate:"required,uuid"`
}

func NewGoToNexTrackSignal(args NewGoToNextTrackSignalArgs) GoToNextTrackSignal {
	return GoToNextTrackSignal{
		Route:  SignalRouteGoToNextTrack,
		UserID: args.UserID,
	}
}

type ChangeUserEmittingDeviceSignal struct {
	Route    shared.SignalRoute `validate:"required"`
	UserID   string             `validate:"required,uuid"`
	DeviceID string             `validate:"required,uuid"`
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
	Route           shared.SignalRoute `validate:"required"`
	TracksToSuggest []string           `validate:"required,dive,required"`
	UserID          string             `validate:"required,uuid"`
	DeviceID        string             `validate:"required,uuid"`
}

type SuggestTracksSignalArgs struct {
	TracksToSuggest []string
	UserID          string
	DeviceID        string
}

func NewSuggestTracksSignal(args SuggestTracksSignalArgs) SuggestTracksSignal {
	return SuggestTracksSignal{
		Route:           SignalRouteSuggestTracks,
		TracksToSuggest: args.TracksToSuggest,
		UserID:          args.UserID,
		DeviceID:        args.DeviceID,
	}
}

type VoteForTrackSignal struct {
	Route   shared.SignalRoute `validate:"required"`
	UserID  string             `validate:"required,uuid"`
	TrackID string             `validate:"required"`
}

type NewVoteForTrackSignalArgs struct {
	UserID  string `validate:"required,uuid"`
	TrackID string `validate:"required"`
}

func NewVoteForTrackSignal(args NewVoteForTrackSignalArgs) VoteForTrackSignal {
	return VoteForTrackSignal{
		Route:   SignalRouteVoteForTrack,
		TrackID: args.TrackID,
		UserID:  args.UserID,
	}
}

type UpdateUserFitsPositionConstraintSignal struct {
	Route                      shared.SignalRoute `validate:"required"`
	UserID                     string             `validate:"required,uuid"`
	UserFitsPositionConstraint bool
}

type NewUpdateUserFitsPositionConstraintSignalArgs struct {
	UserID                     string `validate:"required,uuid"`
	UserFitsPositionConstraint bool
}

func NewUpdateUserFitsPositionConstraintSignal(args NewUpdateUserFitsPositionConstraintSignalArgs) UpdateUserFitsPositionConstraintSignal {
	return UpdateUserFitsPositionConstraintSignal{
		Route:                      SignalUpdateUserFitsPositionConstraint,
		UserID:                     args.UserID,
		UserFitsPositionConstraint: args.UserFitsPositionConstraint,
	}
}

type UpdateDelegationOwnerSignal struct {
	Route                    shared.SignalRoute `validate:"required"`
	NewDelegationOwnerUserID string             `validate:"required,uuid"`
	EmitterUserID            string             `validate:"required,uuid"`
}

type NewUpdateDelegationOwnerSignalArgs struct {
	NewDelegationOwnerUserID string `validate:"required,uuid"`
	EmitterUserID            string `validate:"required,uuid"`
}

func NewUpdateDelegationOwnerSignal(args NewUpdateDelegationOwnerSignalArgs) UpdateDelegationOwnerSignal {
	return UpdateDelegationOwnerSignal{
		Route:                    SignalUpdateDelegationOwner,
		NewDelegationOwnerUserID: args.NewDelegationOwnerUserID,
		EmitterUserID:            args.EmitterUserID,
	}
}

type UpdateControlAndDelegationPermissionSignal struct {
	Route                             shared.SignalRoute `validate:"required"`
	ToUpdateUserID                    string             `validate:"required,uuid"`
	HasControlAndDelegationPermission bool
}

//REMINDER:
//Only the creator is allow to do this operation
//The verification is done upper by adonis itself
//It match a socket_id to a user and the user to a related room
//Passing the creatorUserID in this payload is not a safe
//as the creatorUserID is a public information
type NewUpdateControlAndDelegationPermissionSignalArgs struct {
	ToUpdateUserID                    string
	HasControlAndDelegationPermission bool
}

func NewUpdateControlAndDelegationPermissionSignal(args NewUpdateControlAndDelegationPermissionSignalArgs) UpdateControlAndDelegationPermissionSignal {
	return UpdateControlAndDelegationPermissionSignal{
		Route:                             SignalUpdateControlAndDelegationPermission,
		ToUpdateUserID:                    args.ToUpdateUserID,
		HasControlAndDelegationPermission: args.HasControlAndDelegationPermission,
	}
}
